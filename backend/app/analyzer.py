import pandas as pd


def analyze_dataset(file_path, filename):
    if filename.endswith(".csv"):
        df = pd.read_csv(file_path)
    else:
        df = pd.read_excel(file_path)

    numeric_columns = df.select_dtypes(include=["number"]).columns.tolist()
    categorical_columns = df.select_dtypes(include=["object"]).columns.tolist()

    analysis = {
        "filename": filename,
        "rows": int(df.shape[0]),
        "columns": int(df.shape[1]),
        "column_names": df.columns.tolist(),
        "data_types": df.dtypes.astype(str).to_dict(),
        "missing_values": df.isnull().sum().astype(int).to_dict(),
        "duplicates": int(df.duplicated().sum()),
        "numeric_columns": numeric_columns,
        "categorical_columns": categorical_columns,
        "numeric_summary": df.describe().fillna("").to_dict(),
        "preview": df.head(10).fillna("").to_dict(orient="records")
    }

    return analysis