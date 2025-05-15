import { MaxDistanceClustering } from 'grouping_chart';

export default function sketch(p5) {
    let canvas;
    let points = [];
    let groups = [];
    let sizeSlider;
    let numGroupsInput;
    let uploadedImage;
    let hoveredGroup = null;
    let mouseAction = 'draw';
    let clusterButton, clearPointsButton, clearAllButton, fileInputButton, sliderLabel, clearImageButton, drawButton, eraseButton, statTable;

    p5.setup = () => {
        let canvasWidth = p5.windowWidth * 0.95 - 450;
        let canvasHeight = p5.windowHeight * 0.95;
        canvas = p5.createCanvas(canvasWidth, canvasHeight);

        clusterButton = p5.createButton('Create Groups');
        clusterButton.position(10, 70);
        clusterButton.mousePressed(() => {
            let numGroups = parseInt(numGroupsInput.value(), 10);
            let clusterer = new MaxDistanceClustering(numGroups);
            groups = clusterer.cluster(points.map(point => [point.x, point.y]));
            points.forEach((point, index) => {
                point.group = groups.findIndex(group => group.some(p => p[0] === point.x && p[1] === point.y));
            });
            let clusterStats = clusterer.reportStats(groups);
            updateStatsTable(clusterStats);
        });

        numGroupsInput = p5.createInput('12');
        numGroupsInput.position(10, 40);
        numGroupsInput.label = p5.createP('Number of Groups');
        numGroupsInput.label.position(10, 10);
        numGroupsInput.label.style('font-size', '12px');
        numGroupsInput.label.style('font-family', 'Arial');
        numGroupsInput.style('width', '92px');

        clearPointsButton = p5.createButton('Clear Points');
        clearPointsButton.position(10, canvas.height - 60);
        clearPointsButton.mousePressed(() => {
            points = [];
            groups = [];
        });

        clearImageButton = p5.createButton('Clear Image');
        clearImageButton.position(10, canvas.height - 32);
        clearImageButton.mousePressed(() => {
            uploadedImage = null;
        });

        clearAllButton = p5.createButton('Clear All');
        clearAllButton.position(10, canvas.height - 5);
        clearAllButton.mousePressed(() => {
            points = [];
            groups = [];
            uploadedImage = null;
        });

        sizeSlider = p5.createSlider(5, 50, 20);
        sizeSlider.position(10, 120);
        sliderLabel = p5.createP('Point Size');
        sliderLabel.position(10, 90);
        sliderLabel.style('font-size', '12px');
        sliderLabel.style('font-family', 'Arial');

        let fileInput = p5.createFileInput(handleFile);
        fileInput.position(10, 10);
        fileInput.style('display', 'none');
        fileInputButton = p5.createButton('Upload Image');
        fileInputButton.position(10, 150);
        fileInputButton.mousePressed(() => fileInput.elt.click());

        drawButton = p5.createP('Draw');
        drawButton.position(canvas.width + 130, p5.windowHeight - 120);
        drawButton.id('draw-button');
        drawButton.style('font-size', '16px');
        drawButton.style('background-color', 'lightblue');
        drawButton.style('padding', '5px');
        drawButton.style('border-radius', '5px');
        drawButton.style('font-weight', 'bold');
        drawButton.style('width', '100px');
        drawButton.style('height', '60px');
        drawButton.style('text-align', 'center');
        drawButton.style('line-height', '60px');
        drawButton.style('cursor', 'pointer');
        drawButton.style('user-select', 'none');

        drawButton.class('selected-group');

        drawButton.mousePressed(() => {
            for (let i = 0; i < colours.length; i++) {
                let otherText = p5.select(`#group-label-${i}`);
                if (otherText) {
                    otherText.class('');
                }
            }
            if (mouseAction === 'erase') {
                eraseButton.class('');
            }
            if (mouseAction !== 'draw') {
                mouseAction = 'draw';
                drawButton.class(`selected-group`);
            } else {
                mouseAction = 'erase';
                drawButton.class('');
                eraseButton.class('selected-group');
            }
        });

        eraseButton = p5.createP('Erase');
        eraseButton.position(canvas.width + 130, p5.windowHeight - 200);
        eraseButton.id('erase-button');
        eraseButton.style('font-size', '16px');
        eraseButton.style('background-color', 'lightcoral');
        eraseButton.style('padding', '5px');
        eraseButton.style('border-radius', '5px');
        eraseButton.style('font-weight', 'bold');
        eraseButton.style('width', '100px');
        eraseButton.style('height', '60px');
        eraseButton.style('text-align', 'center');
        eraseButton.style('line-height', '60px');
        eraseButton.style('cursor', 'pointer');
        eraseButton.style('user-select', 'none');
        eraseButton.mousePressed(() => {
            for (let i = 0; i < colours.length; i++) {
                let otherText = p5.select(`#group-label-${i}`);
                if (otherText) {
                    otherText.class('');
                }
            }
            if (mouseAction === 'draw') {
                drawButton.class('');
            }
            if (mouseAction !== 'erase') {
                mouseAction = 'erase';
                eraseButton.class(`selected-group`);
            } else {
                mouseAction = 'draw';
                eraseButton.class('');
                drawButton.class('selected-group');
            }
        });

        let increment = -30;
        for (let index = 0; index < colours.length; index++) {
            let groupText = p5.createP(`Group ${index + 1}`);
            groupText.id(`group-label-${index}`);
            groupText.position(canvas.width + 130, (increment += 35));
            groupText.style('font-size', '16px');
            groupText.style('background-color', colours[index]);
            groupText.style('padding', '5px');
            groupText.style('border-radius', '5px');
            groupText.style('font-weight', 'bold');
            groupText.style('width', '100px');
            groupText.style('text-align', 'center');
            groupText.style('cursor', 'pointer');
            groupText.style('user-select', 'none');
            groupText.mouseOver(() => {
                hoveredGroup = index;
            });
            groupText.mouseOut(() => {
                hoveredGroup = null;
            });
            groupText.mousePressed(() => {
                for (let i = 0; i < colours.length; i++) {
                    let otherText = p5.select(`#group-label-${i}`);
                    if (otherText) {
                        otherText.class('');
                    }
                }
                if (mouseAction === 'draw') {
                    drawButton.class('');
                }
                if (mouseAction === 'erase') {
                    eraseButton.class('');
                }
                if (index + 1 >= 1 && index + 1 <= numGroupsInput.value()) {
                    if (mouseAction !== index + 1) {
                        mouseAction = index + 1;
                        groupText.class(`selected-group`);
                    } else {
                        mouseAction = 'draw';
                        groupText.class('');
                        drawButton.class('selected-group');
                    }
                } else {
                    console.warn(`Invalid group number: ${index + 1}. Must be between 1 and ${numGroupsInput.value()}.`);
                }
            });
        }
        statTable = p5.createDiv('');
        statTable.id('stat-table');
        statTable.position(canvas.width + 250, 25);
        statTable.style('font-size', '14px');
        statTable.style('font-weight', 'bold');
        let statText = p5.createDiv('Statistics will appear here after clustering.');
        statText.id('stat-text');
        statText.parent(statTable);
        statText.style('font-size', '12px');
    };

    p5.windowResized = () => {    
        // Ensure the canvas and UI elements are initialized before resizing
        if (!clusterButton || !numGroupsInput || !clearPointsButton || !clearImageButton || !clearAllButton || !sizeSlider || !sliderLabel || !fileInputButton || !drawButton || !eraseButton) {
            return; // Exit the function if any UI element is not yet initialized
        }
        // Store the old canvas dimensions
        let oldCanvasWidth = p5.width;
        let oldCanvasHeight = p5.height;
    
        // Calculate the aspect ratio of the canvas
        let aspectRatio = oldCanvasWidth / oldCanvasHeight;
    
        // Resize the canvas to fit within the new window dimensions while maintaining aspect ratio
        let maxWidth = p5.windowWidth * 0.95 - 450;
        let maxHeight = p5.windowHeight * 0.95;
    
        let canvasWidth, canvasHeight;
        if (maxWidth / maxHeight > aspectRatio) {
            canvasHeight = maxHeight;
            canvasWidth = canvasHeight * aspectRatio;
        } else {
            canvasWidth = maxWidth;
            canvasHeight = canvasWidth / aspectRatio;
        }
    
        p5.resizeCanvas(canvasWidth, canvasHeight);
    
        // Scale points' coordinates relative to the new canvas size
        points = points.map(point => {
            return {
                x: (point.x / oldCanvasWidth) * canvasWidth,
                y: (point.y / oldCanvasHeight) * canvasHeight,
                group: point.group
            };
        });
    
        // Reposition buttons and UI elements relative to the new canvas size
        clusterButton.position(10, 70);
        numGroupsInput.position(10, 40);
        numGroupsInput.label.position(10, 10);
        clearPointsButton.position(10, canvasHeight - 60);
        clearImageButton.position(10, canvasHeight - 32);
        clearAllButton.position(10, canvasHeight - 5);
        sizeSlider.position(10, 120);
        sliderLabel.position(10, 90);
        fileInputButton.position(10, 150);
        drawButton.position(canvasWidth + 130, p5.windowHeight - 120);
        eraseButton.position(canvasWidth + 130, p5.windowHeight - 200);
    
        // Reposition group labels
        let increment = -30;
        for (let index = 0; index < colours.length; index++) {
            let groupText = p5.select(`#group-label-${index}`);
            if (groupText) {
                groupText.position(canvasWidth + 130, (increment += 35));
            }
        }

        // Reposition the stats table
        statTable.position(canvasWidth + 250, 25);
    };

    function updateStatsTable(clusterStats) {
        let statText = p5.select('#stat-text');
        statText.html(''); // Clear previous stats
        clusterStats.forEach((stat, index) => {
            let groupText = p5.createDiv(`Min Distance: ${stat.stats.minDistance.toFixed(2)} | Avg Distance: ${stat.stats.meanDistance.toFixed(2)}`);
            groupText.style('font-size', '12px');
            groupText.style('margin-bottom', '19.4px');
            groupText.parent(statText);
        });
    }

    function handleFile(file) {
        if (file.type === 'image') {
            uploadedImage = p5.loadImage(file.data, (img) => {
                // Store the old canvas dimensions
                let oldCanvasWidth = p5.width;
                let oldCanvasHeight = p5.height;
    
                // Calculate the aspect ratio of the uploaded image
                let aspectRatio = img.width / img.height;
    
                // Resize the canvas to fit the uploaded image while maintaining its aspect ratio
                let maxWidth = p5.windowWidth * 0.95 - 450;
                let maxHeight = p5.windowHeight * 0.95;
    
                let canvasWidth, canvasHeight;
                if (maxWidth / maxHeight > aspectRatio) {
                    canvasHeight = maxHeight;
                    canvasWidth = canvasHeight * aspectRatio;
                } else {
                    canvasWidth = maxWidth;
                    canvasHeight = canvasWidth / aspectRatio;
                }
    
                p5.resizeCanvas(canvasWidth, canvasHeight);
    
                // Scale points' coordinates relative to the new canvas size
                points = points.map(point => {
                    return {
                        x: (point.x / oldCanvasWidth) * canvasWidth,
                        y: (point.y / oldCanvasHeight) * canvasHeight,
                        group: point.group
                    };
                });
    
                // Reposition buttons and UI elements relative to the new canvas size
                clusterButton.position(10, 70);
                numGroupsInput.position(10, 40);
                numGroupsInput.label.position(10, 10);
                clearPointsButton.position(10, canvasHeight - 60);
                clearImageButton.position(10, canvasHeight - 32);
                clearAllButton.position(10, canvasHeight - 5);
                sizeSlider.position(10, 120);
                sliderLabel.position(10, 90);
                fileInputButton.position(10, 150);
                drawButton.position(canvasWidth + 130, p5.windowHeight - 120);
                eraseButton.position(canvasWidth + 130, p5.windowHeight - 200);
    
                // Reposition group labels
                let increment = -30;
                for (let index = 0; index < colours.length; index++) {
                    let groupText = p5.select(`#group-label-${index}`);
                    if (groupText) {
                        groupText.position(canvasWidth + 130, (increment += 35));
                    }
                }

                // Reposition the stats table
                statTable.position(canvasWidth + 250, 25);
            });
        } else {
            console.error('File is not an image.');
        }
    }

    p5.draw = () => {
        p5.background('lightgrey');

        if (uploadedImage) {
            p5.image(uploadedImage, 0, 0, p5.width, p5.height);
        }

        let ellipseSize = sizeSlider.value();

        if (hoveredGroup !== null) {
            points.forEach(point => {
                if (point.group === hoveredGroup) {
                    p5.fill(colours[hoveredGroup]);
                    p5.ellipse(point.x, point.y, ellipseSize, ellipseSize);
                } else {
                    p5.fill('gray');
                    p5.ellipse(point.x, point.y, ellipseSize, ellipseSize);
                }
            });
        } else {
            points.forEach(point => {
                p5.fill(point.group !== null ? colours[point.group] : 'black');
                p5.ellipse(point.x, point.y, ellipseSize, ellipseSize);
            });
        }
    };

    p5.mousePressed = () => {
        // If the mouse is within the canvas
        if (p5.mouseX >= 0 && p5.mouseX <= p5.width && p5.mouseY >= 0 && p5.mouseY <= p5.height) {
            // If mouseAction is 'draw', add a new point
            if (mouseAction === 'draw') {
                points.push({x: p5.mouseX, y: p5.mouseY, group: null});
            }
            // If mouseAction is 'erase', remove the point under the mouse
            else if (mouseAction === 'erase') {
                points = points.filter(point => {
                    let d = p5.dist(p5.mouseX, p5.mouseY, point.x, point.y);
                    return d > sizeSlider.value() / 2; // Keep points that are not within the radius of the mouse
                });
            }
            // If mouseAction is a number, assign the point to that group
            else if (typeof mouseAction === 'number') {
                if (mouseAction >= 1 && mouseAction <= numGroupsInput.value()) {
                    points.forEach(point => {
                        let d = p5.dist(p5.mouseX, p5.mouseY, point.x, point.y);
                        if (d < sizeSlider.value() / 2) {
                            point.group = mouseAction - 1; // Adjust for zero-based index
                            groups.forEach((group, index) => {
                                groups[index] = group.filter(p => p5.dist(p[0], p[1], p5.mouseX, p5.mouseY) > sizeSlider.value() / 2);
                            });
                            groups[mouseAction - 1].push([ point.x, point.y]);
                            let clusterer = new MaxDistanceClustering(numGroupsInput.value());
                            updateStatsTable(clusterer.reportStats(groups));
                        }
                    });
                } else {
                    console.warn(`Invalid group number: ${mouseAction}. Must be between 1 and ${numGroupsInput.value()}.`);
                }
            }
        }
    };
}

// array of colours for each group
let colours = [
    'rgba(230, 25, 75, 0.8)', 
    'rgba(60, 180, 75, 0.8)', 
    'rgba(255, 225, 25, 0.8)', 
    'rgba(67, 99, 216, 0.8)', 
    'rgba(245, 130, 49, 0.8)', 
    'rgba(145, 30, 180, 0.8)', 
    'rgba(66, 212, 244, 0.8)', 
    'rgba(240, 50, 230, 0.8)', 
    'rgba(191, 239, 69, 0.8)', 
    'rgba(250, 190, 212, 0.8)', 
    'rgba(70, 153, 144, 0.8)', 
    'rgba(220, 190, 255, 0.8)'
];