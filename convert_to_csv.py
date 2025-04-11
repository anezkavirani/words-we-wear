import pandas as pd
import os

# Read the Excel file
df = pd.read_excel('Full List Dialogs Dataset.xlsx')

# Convert Year column to numeric (note the space in 'Year ')
df['Year '] = pd.to_numeric(df['Year '], errors='coerce')

# Define year ranges
year_ranges = [
    (1990, 1994),
    (1995, 1999),
    (2000, 2004),
    (2005, 2009),
    (2010, 2014),
    (2015, 2019),
    (2020, 2024)
]

# Create a directory for the year range files
os.makedirs('year_ranges', exist_ok=True)

# Save main CSV file
df.to_csv('disney_dialogs.csv', index=False)

# Create and save separate CSV files for each year range
for start_year, end_year in year_ranges:
    # Filter data for the current year range
    range_df = df[(df['Year '] >= start_year) & (df['Year '] <= end_year)]
    
    # Save to CSV
    filename = f'year_ranges/{start_year}-{end_year}.csv'
    range_df.to_csv(filename, index=False)
    print(f"Created {filename} with {len(range_df)} entries")

print("\nAll files have been created successfully!") 