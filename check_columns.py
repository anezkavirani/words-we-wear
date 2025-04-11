import pandas as pd

# Read the Excel file
df = pd.read_excel('Full List Dialogs Dataset.xlsx')

# Print column names
print("Column names in the Excel file:")
print(df.columns.tolist())

# Print first few rows to see the data
print("\nFirst few rows of data:")
print(df.head()) 