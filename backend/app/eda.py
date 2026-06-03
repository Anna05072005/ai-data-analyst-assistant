def generate_chart_data(df):
    charts = []

    numeric_columns = df.select_dtypes(include=["number"]).columns.tolist()
    categorical_columns = df.select_dtypes(include=["object"]).columns.tolist()

    missing_counts = df.isnull().sum()
    missing_counts = missing_counts[missing_counts > 0].sort_values(ascending=False)

    charts.append({
        "title": "Missing Values by Column",
        "type": "bar",
        "data": [
            {"name": str(column), "value": int(value)}
            for column, value in missing_counts.items()
        ]
    })

    for column in numeric_columns[:3]:
        values = df[column].dropna().head(30)

        charts.append({
            "title": f"{column} Trend Preview",
            "type": "line",
            "data": [
                {"name": str(index), "value": float(value)}
                for index, value in values.items()
            ]
        })

    for column in categorical_columns[:3]:
        counts = df[column].fillna("Missing").value_counts().head(10)

        charts.append({
            "title": f"{column} Breakdown",
            "type": "bar",
            "data": [
                {"name": str(category), "value": int(count)}
                for category, count in counts.items()
            ]
        })

    return charts