# Words We Wear: Disney Dialogues Visualization

An interactive data visualization that analyzes Disney character dialogues with gender analysis, using p5.js and ML5.js for real-time person detection and interaction.

## Live Demo
The visualization is available at: [https://words-we-wear.vercel.app](https://words-we-wear.vercel.app)

## Project Overview

This visualization explores Disney character dialogues across different time periods (1990-2024) and analyzes them through the lens of gender representation. The project uses PoseNet for real-time person detection, allowing users to interact with the visualization through movement.

## Movies Analyzed

1990-1994:
- Beauty and the Beast (1991)
- Aladdin (1992)
- The Lion King (1994)

1995-1999:
- Toy Story (1995)
- Toy Story 2 (1999)
- A Bug's Life (1998)

2000-2004:
- Monsters, Inc. (2001)
- Finding Nemo (2003)
- The Incredibles (2004)

2005-2009:
- Cars (2006)
- Ratatouille (2007)
- WALL-E (2008)
- Up (2009)

2010-2014:
- Toy Story 3 (2010)
- Brave (2012)
- Frozen (2013)
- Big Hero 6 (2014)

2015-2019:
- Inside Out (2015)
- Zootopia (2016)
- Coco (2017)
- Toy Story 4 (2019)

2020-2024:
- Soul (2020)
- Luca (2021)
- Turning Red (2022)
- Elemental (2023)

Note: This list includes both Disney and Pixar films, as they are both part of The Walt Disney Company's animation portfolio.

## Features

- **Interactive Visualization**: Real-time person detection that triggers dialogue displays
- **Gender Analysis**: Color-coded sections representing different gender combinations
- **Temporal Organization**: Dialogues organized by year ranges from 1990-2024
- **Dynamic Speech Bubbles**: Displays relevant dialogues when users move over specific sections
- **Shooting Star Effect**: Visual trail following detected movements

## Color Scheme

- **Female-Female Dialogues**: #ff43ae (Pink)
- **Male-Male Dialogues**: #2254d7 (Blue)
- **Female-to-Male Dialogues**: #a4c7ff (Deep Blue)
- **Male-to-Female Dialogues**: #ffcfe6 (Lavender)

## Project Structure

```
.
├── index.html          # Main HTML file
├── sketch.js           # Main visualization code
├── year_ranges/        # Directory containing CSV files for each time period
│   ├── 1990-1994.csv
│   ├── 1995-1999.csv
│   ├── 2000-2004.csv
│   ├── 2005-2009.csv
│   ├── 2010-2014.csv
│   ├── 2015-2019.csv
│   └── 2020-2024.csv
├── convert_to_csv.py   # Script for converting Excel data to CSV
└── check_columns.py    # Script for verifying data structure
```

## Technical Implementation

### Dependencies
- p5.js: For canvas rendering and animation
- ML5.js: For PoseNet person detection
- Python scripts for data preprocessing

### Key Components

1. **Data Loading**
   - CSV files containing dialogue data for each time period
   - Data includes: Dialog text, Actual Gender, Inferred Gender

2. **Visualization**
   - Canvas size: 3072 x 1280 pixels
   - Vertical sections representing different dialogues
   - Color-coded based on gender analysis

3. **Person Detection**
   - Uses PoseNet for real-time person tracking
   - Detects up to 5 people simultaneously
   - Creates shooting star trails following movement

4. **Speech Bubbles**
   - Appears when person moves over a dialogue section
   - Shows relevant dialogue text
   - Color-coded to match the section
   - Positioned relative to detected person

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run a local server (e.g., using Python's http.server or Node's http-server)
4. Open the project in a web browser

## Usage

1. Allow camera access when prompted
2. Move in front of the camera to be detected
3. Move across different colored sections to see different dialogues
4. Multiple people can interact simultaneously

## Data Format

Each CSV file contains the following columns:
- Dialog: The actual dialogue text
- Actual Gender: The character's actual gender
- Inferred Gender: The gender as inferred from the dialogue
- Movie: Movie name (not displayed in visualization)
- Year: Release year (not displayed in visualization)

## Credits

Created as part of LMC 6650 at Georgia Institute of Technology.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 