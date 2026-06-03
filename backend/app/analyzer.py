import pandas as pd
from app.eda import generate_chart_data


def calculate_health_score(df):
    total_cells = df.shape[0] * df.shape[1]

    if total_cells == 0:
        return 0

    missing_values = int(df.isnull().sum().sum())
    duplicate_rows = int(df.duplicated().sum())

    missing_rate = missing_values / total_cells
    duplicate_rate = duplicate_rows / max(df.shape[0], 1)

    score = 100
    score -= missing_rate * 60
    score -= duplicate_rate * 25

    if df.shape[1] < 3:
        score -= 15

    return max(0, min(100, round(score)))


def generate_recommendations(df):
    recommendations = []
    total_rows = df.shape[0]

    for column, missing_count in df.isnull().sum().items():
        if missing_count > 0:
            missing_percent = (missing_count / total_rows) * 100

            if missing_percent > 50:
                recommendations.append(
                    f"{column} has {missing_percent:.1f}% missing values. Avoid using it directly for modeling until it is cleaned or imputed."
                )
            elif missing_percent > 20:
                recommendations.append(
                    f"{column} has {missing_percent:.1f}% missing values. Review this column before analysis."
                )

    duplicate_count = int(df.duplicated().sum())

    if duplicate_count == 0:
        recommendations.append("No duplicate records were detected.")
    else:
        recommendations.append(
            f"{duplicate_count} duplicate records were found. Remove them before further analysis."
        )

    numeric_columns = df.select_dtypes(include=["number"]).columns.tolist()

    if numeric_columns:
        recommendations.append(
            f"{len(numeric_columns)} numeric columns were found and can be used for statistical analysis."
        )

    return recommendations


def generate_column_risks(df):
    risks = []
    total_rows = df.shape[0]

    for column in df.columns:
        missing_count = int(df[column].isnull().sum())
        missing_percent = (missing_count / total_rows) * 100 if total_rows > 0 else 0

        if missing_percent >= 50:
            risk_level = "High"
        elif missing_percent >= 20:
            risk_level = "Medium"
        elif missing_percent > 0:
            risk_level = "Low"
        else:
            risk_level = "Clean"

        risks.append({
            "column": column,
            "missing_values": missing_count,
            "missing_percent": round(missing_percent, 1),
            "data_type": str(df[column].dtype),
            "risk_level": risk_level
        })

    return risks


def analyze_dataset(file_path, filename):
    if filename.endswith(".csv"):
        df = pd.read_csv(file_path)
    else:
        df = pd.read_excel(file_path)

    numeric_columns = df.select_dtypes(include=["number"]).columns.tolist()
    categorical_columns = df.select_dtypes(include=["object"]).columns.tolist()

    total_missing = int(df.isnull().sum().sum())
    total_cells = int(df.shape[0] * df.shape[1])
    missing_rate = round((total_missing / total_cells) * 100, 1) if total_cells > 0 else 0

    return {
        "filename": filename,
        "rows": int(df.shape[0]),
        "columns": int(df.shape[1]),
        "column_names": df.columns.tolist(),
        "data_types": df.dtypes.astype(str).to_dict(),
        "missing_values": df.isnull().sum().astype(int).to_dict(),
        "total_missing": total_missing,
        "missing_rate": missing_rate,
        "duplicates": int(df.duplicated().sum()),
        "numeric_columns": numeric_columns,
        "categorical_columns": categorical_columns,
        "health_score": calculate_health_score(df),
        "recommendations": generate_recommendations(df),
        "column_risks": generate_column_risks(df),
        "charts": generate_chart_data(df),
        "preview": df.head(10).fillna("").to_dict(orient="records")
    }