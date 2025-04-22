let dialogData = {};
let yearRanges = [
    "1990-1994",
    "1995-1999",
    "2000-2004",
    "2005-2009",
    "2010-2014",
    "2015-2019",
    "2020-2024"
];

// Color definitions
const COLORS = {
    BOTH_FEMALE: '#ff43ae',  // Pink
    BOTH_MALE: '#2254d7',    // Blue
    ACTUAL_F_INFERRED_M: '#a4c7ff',  // Deep Blue
    ACTUAL_M_INFERRED_F: '#ffcfe6',   // Lavender
    INFERRED_FEMALE_STRIPE: '#ff69b4', // Bright pink for stripes
    INFERRED_MALE_STRIPE: '#007bff'    // Bright blue for stripes
};

let allDataLoaded = false;
let squareWidth;
let hoveredDialog = null;
let hoveredDialogData = null;

// Person detection variables
let video;
let poseNet;
let poses = [];
let attachedDialogs = [];
let personTrails = []; // Array to store trails for each person

function preload() {
    // Load all CSV files
    for (let range of yearRanges) {
        loadTable(`year_ranges/${range}.csv`, 'csv', 'header', (data) => {
            dialogData[range] = data;
            console.log(`Loaded data for ${range}:`, data.getRowCount(), 'rows');
            
            // Check if all data is loaded
            if (Object.keys(dialogData).length === yearRanges.length) {
                allDataLoaded = true;
                console.log('All data loaded successfully!');
            }
        });
    }
}

function setup() {
    // Create canvas with specified dimensions
    createCanvas(3072, 1280);
    
    // Set up video with error handling
    video = createCapture(VIDEO, function(stream) {
        console.log('Video stream started');
    });
    video.size(width, height);
    video.hide();
    
    // Set up PoseNet with options optimized for multiple people
    const options = {
        architecture: 'MobileNetV1',
        imageScaleFactor: 0.3,
        outputStride: 16,
        flipHorizontal: true,
        minConfidence: 0.5,
        maxPoseDetections: 5, // Increased from default to handle more people
        scoreThreshold: 0.5,
        nmsRadius: 20,
        detectionType: 'multiple', // Changed to 'multiple' to detect multiple people
        inputResolution: { width: 640, height: 480 },
        multiplier: 0.75
    };
    
    // Initialize PoseNet with better error handling
    try {
        poseNet = ml5.poseNet(video, options, function() {
            console.log('PoseNet Model Loaded!');
            // Add event listener for poses
            poseNet.on('pose', function(results) {
                poses = results;
                console.log('Detected poses:', poses.length);
            });
        });
    } catch (error) {
        console.error('Error initializing PoseNet:', error);
    }
    
    // Set background color to dark galaxy blue
    background(10, 15, 30);
    
    // Calculate grid dimensions
    const numCols = 7;
    squareWidth = width / numCols;
    
    // Initialize personTrails array
    personTrails = [];
}

function draw() {
    // Clear the canvas with dark galaxy blue
    background(10, 15, 30);
    
    // Draw video feed (optional, comment out if you don't want to see it)
    // push();
    // translate(width, 0);
    // scale(-1, 1);
    // image(video, 0, 0, width, height);
    // pop();
    
    // Only draw sections when all data is loaded
    if (allDataLoaded) {
        // Draw sections for each year range
        for (let i = 0; i < yearRanges.length; i++) {
            const range = yearRanges[i];
            if (dialogData[range]) {
                const data = dialogData[range];
                const columnLeft = i * squareWidth;
                const sectionHeight = height / data.getRowCount();
                
                for (let j = 0; j < data.getRowCount(); j++) {
                    const dialogRow = data.getRow(j);
                    // Check if dialogRow and its properties exist
                    if (dialogRow && dialogRow.getString) {
                        const actualGender = dialogRow.getString('Actual Gender')?.trim() || '';
                        const inferredGender = dialogRow.getString('Inferred Gender')?.trim() || '';
                        const dialog = dialogRow.getString('Dialog') || '';
                        
                        // Debug logging for all rows
                        console.log(`Processing row ${j}:`, {
                            actualGender,
                            inferredGender,
                            dialog: dialog.substring(0, 50) + '...'
                        });
                        
                        // Determine section color or pattern based on gender matching
                        if (actualGender === 'NA') {
                            console.log(`Drawing stripes for NA gender:`, {
                                inferredGender,
                                position: { x: columnLeft, y: j * sectionHeight },
                                dimensions: { width: squareWidth, height: sectionHeight }
                            });
                            
                            // Use stripes for NA actual gender
                            if (inferredGender === 'Female') {
                                drawStripes(columnLeft, j * sectionHeight, squareWidth, sectionHeight, COLORS.INFERRED_FEMALE_STRIPE);
                            } else if (inferredGender === 'Male') {
                                drawStripes(columnLeft, j * sectionHeight, squareWidth, sectionHeight, COLORS.INFERRED_MALE_STRIPE);
                            }
                        } else {
                            // Normal color cases
                            let sectionColor;
                            if (actualGender === 'Female' && inferredGender === 'Female') {
                                sectionColor = COLORS.BOTH_FEMALE;
                            } else if (actualGender === 'Male' && inferredGender === 'Male') {
                                sectionColor = COLORS.BOTH_MALE;
                            } else if (actualGender === 'Female' && inferredGender === 'Male') {
                                sectionColor = COLORS.ACTUAL_F_INFERRED_M;
                            } else if (actualGender === 'Male' && inferredGender === 'Female') {
                                sectionColor = COLORS.ACTUAL_M_INFERRED_F;
                            }
                            
                            if (sectionColor) {
                                noStroke();
                                fill(sectionColor);
                                rect(columnLeft, j * sectionHeight, squareWidth, sectionHeight);
                            }
                        }
                    }
                }
            }
        }
        
        // Update and draw trails for each person
        for (let i = 0; i < poses.length; i++) {
            let pose = poses[i].pose;
            
            // Get nose position as reference point for the person
            let nose = pose.keypoints[0];
            if (nose.score > 0.5) {
                // Initialize trail for this person if it doesn't exist
                if (!personTrails[i]) {
                    personTrails[i] = [];
                }
                
                // Add current position to trail
                personTrails[i].push({
                    x: nose.position.x,
                    y: nose.position.y,
                    alpha: 255 // Start with full opacity
                });
                
                // Keep only the last 20 positions
                if (personTrails[i].length > 20) {
                    personTrails[i].shift();
                }
                
                // Draw trail
                for (let j = 0; j < personTrails[i].length; j++) {
                    let pos = personTrails[i][j];
                    // Calculate opacity based on position in trail
                    let alpha = map(j, 0, personTrails[i].length - 1, 30, 255);
                    noStroke();
                    fill(255, 255, 255, alpha);
                    // Draw smaller dots for the trail with increased density
                    ellipse(pos.x, pos.y, map(j, 0, personTrails[i].length - 1, 8, 30));
                }
                
                // Draw current position (white dot)
                fill(255);
                noStroke();
                ellipse(nose.position.x, nose.position.y, 30, 30); // Increased size of white dot
                
                // Check if person is in any section
                let col = floor(nose.position.x / squareWidth);
                if (col >= 0 && col < yearRanges.length) {
                    let range = yearRanges[col];
                    if (dialogData[range]) {
                        let data = dialogData[range];
                        let row = floor(nose.position.y / (height / data.getRowCount()));
                        if (row >= 0 && row < data.getRowCount()) {
                            let dialogRow = data.getRow(row);
                            // Check if dialogRow exists and has the required methods
                            if (dialogRow && typeof dialogRow.getString === 'function') {
                                try {
                                    // Safely get values with default empty strings and proper type checking
                                    const dialog = dialogRow.getString('Dialog')?.toString() ?? '';
                                    const actualGender = dialogRow.getString('Actual Gender')?.toString()?.trim() ?? '';
                                    const inferredGender = dialogRow.getString('Inferred Gender')?.toString()?.trim() ?? '';
                                    
                                    // Only proceed if we have valid data
                                    if (dialog && actualGender && inferredGender) {
                                        // Get color for the dialog
                                        const sectionColor = getColorForDialog(dialogRow);
                                        
                                        // Draw speech bubble directly
                                        drawSpeechBubble(
                                            nose.position.x,
                                            nose.position.y,
                                            dialog,
                                            sectionColor,
                                            range
                                        );
                                    }
                                } catch (error) {
                                    console.log('Error accessing dialog data:', error);
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // Clean up trails for people who are no longer detected
        if (personTrails.length > poses.length) {
            personTrails = personTrails.slice(0, poses.length);
        }
    } else {
        // Show loading message
        fill(255);
        textSize(24);
        textAlign(CENTER, CENTER);
        text('Loading data...', width/2, height/2);
    }
}

function getColorForDialog(dialogRow) {
    try {
        if (!dialogRow || typeof dialogRow.getString !== 'function') return '#FFFFFF';
        
        // Use optional chaining and nullish coalescing
        const actualGender = dialogRow.getString('Actual Gender')?.toString()?.trim() ?? '';
        const inferredGender = dialogRow.getString('Inferred Gender')?.toString()?.trim() ?? '';
        
        if (actualGender === 'Female' && inferredGender === 'Female') {
            return COLORS.BOTH_FEMALE;
        } else if (actualGender === 'Male' && inferredGender === 'Male') {
            return COLORS.BOTH_MALE;
        } else if (actualGender === 'Female' && inferredGender === 'Male') {
            return COLORS.ACTUAL_F_INFERRED_M;
        } else if (actualGender === 'Male' && inferredGender === 'Female') {
            return COLORS.ACTUAL_M_INFERRED_F;
        }
        return '#FFFFFF';
    } catch (error) {
        console.log('Error in getColorForDialog:', error);
        return '#FFFFFF';
    }
}

function drawSpeechBubble(x, y, dialogText, bubbleColor, yearRange) {
    // Set up text
    textSize(28);
    textAlign(LEFT);
    
    // Calculate bubble dimensions
    const padding = 40;
    const maxWidth = 600;
    const lineHeight = 42;
    
    // Split text into lines that fit within maxWidth
    const words = dialogText.split(' ');
    let lines = [];
    let currentLine = '';
    
    for (let word of words) {
        let testLine = currentLine + word + ' ';
        let testWidth = textWidth(testLine);
        
        if (testWidth > maxWidth && currentLine !== '') {
            lines.push(currentLine);
            currentLine = word + ' ';
        } else {
            currentLine = testLine;
        }
    }
    lines.push(currentLine);
    
    // Calculate bubble dimensions
    const bubbleWidth = maxWidth + (padding * 2);
    const bubbleHeight = (lines.length * lineHeight) + (padding * 2);
    
    // Position bubble with offset for multiple people
    let bubbleX = x + 40;
    let bubbleY = y - bubbleHeight/2;
    
    // Adjust position if bubble goes off screen
    if (bubbleX + bubbleWidth > width) {
        bubbleX = x - bubbleWidth - 40;
    }
    if (bubbleY < 0) {
        bubbleY = 0;
    }
    if (bubbleY + bubbleHeight > height) {
        bubbleY = height - bubbleHeight;
    }
    
    // Create darker shade of the bubble color
    let c = color(bubbleColor);
    let darkerColor = color(
        red(c) * 0.6,
        green(c) * 0.6,
        blue(c) * 0.6
    );
    
    // Draw bubble
    fill(darkerColor);
    stroke(darkerColor);
    strokeWeight(3);
    rect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 20);
    
    // Draw triangle pointer
    noStroke();
    fill(darkerColor);
    triangle(
        x + 20, y,
        x + 40, y - 20,
        x + 40, y + 20
    );
    
    // Draw dialog text
    fill(255);
    noStroke();
    textSize(28);
    textAlign(LEFT);
    for (let i = 0; i < lines.length; i++) {
        text(lines[i], bubbleX + padding, bubbleY + padding + (i * lineHeight));
    }
}

function mouseMoved() {
    // Remove this since we're not using hover anymore
    // hoveredDialog = null;
    // redraw();
}

// Update the drawStripes function to be more visible
function drawStripes(x, y, width, height, color) {
    console.log('Drawing stripes:', { x, y, width, height, color });
    
    const stripeWidth = 20; // Made stripes narrower but more frequent
    const numStripes = Math.ceil(width / stripeWidth);
    
    push(); // Save current drawing state
    
    // Draw background first
    fill(255); // White background
    noStroke();
    rect(x, y, width, height);
    
    // Draw colored stripes on top
    for (let i = 0; i < numStripes; i++) {
        if (i % 2 === 0) { // Only draw colored stripes, leaving white spaces
            fill(color);
            noStroke();
            rect(x + i * stripeWidth, y, stripeWidth, height);
        }
    }
    
    // Add a border around the entire section
    stroke(color);
    strokeWeight(3); // Increased border weight
    noFill();
    rect(x, y, width, height);
    
    pop(); // Restore drawing state
} 