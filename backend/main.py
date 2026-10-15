
@app.post("/api/analyse/video", response_model=AnalysisReport)
def analyse_video(req: VideoAnalysisRequest):
    """
    Analyse live TikTok comments or an explicitly
    selected sample dataset.
    """

    # DEMO MODE
    if req.demo_mode:
        dataset = req.sample_dataset or "lifestyle"

        if dataset not in ("lifestyle", "tech"):
            raise HTTPException(
                status_code=400,
                detail="Invalid sample dataset selected."
            )

        csv_file = f"sample_tiktok_{dataset}.csv"
        sample_comments = load_sample_csv(csv_file)

        if not sample_comments:
            raise HTTPException(
                status_code=404,
                detail="Sample dataset could not be loaded."
            )

        captions = {
            "lifestyle": "Botanical skincare morning routine",
            "tech": "Technology product review"
        }

        metadata = {
            "video_id": f"sample_{dataset}",
            "video_url": "",
            "caption": captions[dataset],
            "author_username": "demo_creator",
            "author_nickname": "Sample Dataset",
            "thumbnail_url": None,
            "likes_count": None,
            "shares_count": None,
            "published_at": None,
            "data_source": "demo",
            "notice": (
                "This analysis uses sample comments, "
                "not live TikTok comments."
            )
        }

        return run_sentiment_pipeline(
            sample_comments,
            metadata
        )

    # LIVE TIKTOK MODE
    video_id = tiktok_service.extract_video_id(req.url)

    if not video_id:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid TikTok video URL. "
                "Please provide a direct link to a TikTok video."
            )
        )

    # Retrieve real comments
    metadata, comments, error = (
        tiktok_service.fetch_video_data(req.url)
    )

    if not comments:
        raise HTTPException(
            status_code=502,
            detail=error or (
                "Unable to retrieve TikTok comments. "
                "The video may be private, comments may "
                "be disabled, or TikTok may have blocked "
                "the request. Please try another video "
                "or upload a comments CSV."
            )
        )

    if not metadata:
        raise HTTPException(
            status_code=502,
            detail="TikTok video metadata could not be retrieved."
        )

    # Analyse comments with VADER and Hugging Face
    return run_sentiment_pipeline(
        comments,
        metadata
    )


@app.post("/api/analyse/csv", response_model=AnalysisReport)
async def analyse_csv(
    file: UploadFile = File(...),
    video_id: str = Form("uploaded_video"),
    caption: str = Form("Exported TikTok Comments CSV"),
    author: str = Form("tiktok_creator")
):
    """
    Parses user-uploaded CSV comments and runs sentiment analysis.
    """
    content = await file.read()
    decoded = content.decode("utf-8-sig", errors="replace")
    reader = csv.DictReader(io.StringIO(decoded))

    comments = []

    for row in reader:
        comment_text = (
            row.get("comment_text")
            or row.get("comment")
            or row.get("text")
            or row.get("content")
            or ""
        )

        if comment_text.strip():
            raw_likes = row.get("likes") or row.get("digg_count") or 0

            try:
                likes = int(raw_likes)
            except (ValueError, TypeError):
                likes = 0

            comments.append({
                "comment_id": (
                    row.get("comment_id")
                    or row.get("id")
                    or f"c_{len(comments) + 1}"
                ),
                "author": (
                    row.get("author")
                    or row.get("username")
                    or row.get("user")
                    or f"user_{len(comments) + 1}"
                ),
                "comment_text": comment_text.strip(),
                "likes": likes,
                "timestamp": (
                    row.get("timestamp")
                    or row.get("date")
                    or row.get("create_time")
                    or datetime.utcnow().isoformat()
                )
            })

    if not comments:
        raise HTTPException(
            status_code=400,
            detail=(
                "The uploaded CSV does not contain valid comments. "
                "Expected a column named comment, text, "
                "comment_text, or content."
            )
        )

    metadata = {
        "video_id": video_id,
        "video_url": "",
        "caption": caption,
        "author_username": author,
        "likes_count": None,
        "shares_count": None,
        "data_source": "csv_upload",
        "notice": (
            f"Analysed {len(comments)} comments "
            "from the uploaded CSV file."
        )
    }

    return run_sentiment_pipeline(comments, metadata)


@app.get("/api/analysis/history", response_model=List[HistoryItem])
def get_analysis_history():
    return get_history()


@app.get("/api/analysis/{analysis_id}", response_model=AnalysisReport)
def get_analysis(analysis_id: str):
    report = get_analysis_by_id(analysis_id)

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Analysis report not found."
        )

    return report


@app.get("/api/analysis/{analysis_id}/export")
def export_csv(analysis_id: str):
    report = get_analysis_by_id(analysis_id)

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Analysis report not found."
        )

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "Comment ID",
        "Author",
        "Comment Text",
        "Likes",
        "Timestamp",
        "VADER Sentiment",
        "VADER Compound Score",
        "VADER Pos",
        "VADER Neg",
        "VADER Neu",
        "HF RoBERTa Sentiment",
        "HF Confidence",
        "Detected Emotion",
        "Emotion Confidence",
        "Extracted Emojis",
        "Model Disagreement"
    ])

    for comment in report.get("comments", []):
        vader = comment.get("vader", {})
        hf = comment.get("huggingface", {})
        emotion = comment.get("emotion", {})

        writer.writerow([
            comment.get("id"),
            comment.get("author"),
            comment.get("text"),
            comment.get("likes", 0),
            comment.get("timestamp", ""),
            vader.get("sentiment", ""),
            vader.get("compound", 0.0),
            vader.get("pos", 0.0),
            vader.get("neg", 0.0),
            vader.get("neu", 0.0),
            hf.get("label", ""),
            hf.get("confidence", 0.0),
            emotion.get("top_emotion", ""),
            emotion.get("confidence", 0.0),
            " ".join(comment.get("emojis", [])),
            "YES" if comment.get("has_disagreement") else "NO"
        ])

    output.seek(0)

    response = StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv"
    )

    response.headers["Content-Disposition"] = (
        f"attachment; filename=auralens_{analysis_id}.csv"
    )

    return response
