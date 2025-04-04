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
    let clusterButton, clearPointsButton, clearAllButton, fileInputButton, sliderLabel, clearImageButton, drawButton, eraseButton;

    p5.setup = () => {
        canvas = p5.createCanvas(1600, 900);

        clusterButton = p5.createButton('Create Groups');
        clusterButton.position(10, 70);
        clusterButton.mousePressed(() => {
            let numGroups = parseInt(numGroupsInput.value(), 10);
            let clusterer = new MaxDistanceClustering(numGroups);
            groups = clusterer.cluster(points.map(point => [point.x, point.y]));
            points.forEach((point, index) => {
                point.group = groups.findIndex(group => group.some(p => p[0] === point.x && p[1] === point.y));
            });
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
        drawButton.position(canvas.width + 130, canvas.height - 66);
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
        drawButton.position(drawButton.x - 1, drawButton.y - 1);

        drawButton.mousePressed(() => {
            for (let i = 0; i < colours.length; i++) {
                let otherText = p5.select(`#group-label-${i}`);
                if (otherText) {
                    otherText.class('');
                    otherText.position(otherText.x + 1, otherText.y + 1);
                }
            }
            if (mouseAction === 'erase') {
                eraseButton.class('');
                eraseButton.position(eraseButton.x + 1, eraseButton.y + 1);
            }
            if (mouseAction !== 'draw') {
                mouseAction = 'draw'; // Set the mouse action to draw
                drawButton.class(`selected-group`);
                drawButton.position(drawButton.x - 1, drawButton.y - 1);
            } else {
                mouseAction = 'erase'; // Reset to erase action
                drawButton.class('');
                drawButton.position(drawButton.x + 1, drawButton.y + 1);
                eraseButton.class('selected-group');
                eraseButton.position(eraseButton.x - 1, eraseButton.y - 1);
            }
        });

        eraseButton = p5.createP('Erase');
        eraseButton.position(canvas.width + 130, canvas.height - 148);
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
                    otherText.position(otherText.x + 1, otherText.y + 1);
                }
            }
            if (mouseAction === 'draw') {
                drawButton.class('');
                drawButton.position(drawButton.x + 1, drawButton.y + 1);
            }
            if (mouseAction !== 'erase') {
                mouseAction = 'erase'; // Set the mouse action to erase
                eraseButton.class(`selected-group`);
                eraseButton.position(eraseButton.x - 1, eraseButton.y - 1);
            } else {
                mouseAction = 'draw'; // Reset to draw action
                eraseButton.class('');
                eraseButton.position(eraseButton.x + 1, eraseButton.y + 1);
                drawButton.class('selected-group');
                drawButton.position(drawButton.x - 1, drawButton.y - 1);
            }
        });

        let increment = -36;
        for (let index = 0; index < colours.length; index++) {
            let groupText = p5.createP(`Group ${index + 1}`);
            groupText.id(`group-label-${index}`); // Assign a unique ID
            groupText.position(canvas.width + 130, (increment += 40));
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
                        otherText.position(otherText.x + 1, otherText.y + 1);
                    }
                }
                if (mouseAction === 'draw') {
                    drawButton.class('');
                    drawButton.position(drawButton.x + 1, drawButton.y + 1);
                }
                if (mouseAction === 'erase') {
                    eraseButton.class('');
                    eraseButton.position(eraseButton.x + 1, eraseButton.y + 1);
                }
                if (index + 1 >= 1 && index + 1 <= numGroupsInput.value()) {
                    if (mouseAction !== index + 1) {
                        mouseAction = index + 1; // Set the mouse action to the group number
                        groupText.class(`selected-group`);
                        groupText.position(groupText.x - 1, groupText.y - 1);
                    } else {
                        mouseAction = 'draw'; // Reset to draw action
                        groupText.class('');
                        groupText.position(groupText.x + 1, groupText.y + 1);
                        drawButton.class('selected-group');
                        drawButton.position(drawButton.x - 1, drawButton.y - 1);
                    }
                } else {
                    console.warn(`Invalid group number: ${index + 1}. Must be between 1 and ${numGroupsInput.value()}.`);
                }
            });
        }
    };

    function handleFile(file) {
        if (file.type === 'image') {
            uploadedImage = p5.loadImage(file.data, (img) => {
                p5.resizeCanvas(img.width, img.height);
    
                clusterButton.position(10, 100);
                numGroupsInput.position(10, 70);
                numGroupsInput.label.position(10, 40);
                clearPointsButton.position(10, img.height - 30);
                clearImageButton.position(10, img.height - 2);
                clearAllButton.position(10, img.height + 25);
                sizeSlider.position(10, 150);
                sliderLabel.position(10, 120);
                fileInputButton.position(10, 180);
    
                let increment = -28;
                for (let index = 0; index < colours.length; index++) {
                    let text = p5.select(`#group-label-${index}`);
                    if (text) {
                        text.position(img.width + 130, (increment += 32));
                    }
                }
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
                        }
                    });
                } else {
                    console.warn(`Invalid group number: ${mouseAction}. Must be between 1 and ${numGroupsInput.value()}.`);
                }
            }
        }


        //     // Check if the mouse is over an existing point
        //     let pointFound = false;
        //     for (let i = 0; i < points.length; i++) {
        //         let point = points[i];
        //         let d = p5.dist(p5.mouseX, p5.mouseY, point.x, point.y);
        //         if (d < sizeSlider.value() / 2) {
        //             // If the mouse is over an existing point, bring up dialog box with options
        //             let groupNum = point.group !== null ? point.group + 1 : 'None';
        //             pointFound = true;
        //             break;
        //         }
        //     }
        //     // If the mouse is not over an existing point, add a new point
        //     if (!pointFound) {
        //         points.push({x: p5.mouseX, y: p5.mouseY, group: null});
        //         groups = [];
        //     }
        // }
    };

    p5.myCustomRedrawAccordingToNewPropsHandler = (newProps) => {
        if (canvas) // Make sure the canvas has been created
            p5.fill(newProps.color);
    };
}

// array of colours for each group
let colours = ['#E6194B', '#3CB44B', '#FFE119', '#4363D8', '#F58231', '#911EB4', '#42D4F4', '#F032E6', '#BFEF45', '#FABED4', '#469990', '#DCBEFF'];