import { MaxDistanceClustering } from 'grouping_chart';

export default function sketch(p5) {
    let canvas;
    let points = [];
    let groups = [];
    let sizeSlider;
    let numGroupsInput;
    let uploadedImage;
    let clusterButton, clearPointsButton, clearAllButton, fileInputButton, sliderLabel, clearImageButton;

    p5.setup = () => {
        canvas = p5.createCanvas(1600, 900);

        clusterButton = p5.createButton('Create Groups');
        clusterButton.position(10, 100);
        clusterButton.mousePressed(() => {
            let numGroups = parseInt(numGroupsInput.value(), 10);
            let clusterer = new MaxDistanceClustering(numGroups);
            groups = clusterer.cluster(points);
        });

        numGroupsInput = p5.createInput('12');
        numGroupsInput.position(10, 70);
        numGroupsInput.label = p5.createP('Number of Groups');
        numGroupsInput.label.position(10, 40);
        numGroupsInput.label.style('font-size', '12px');
        numGroupsInput.label.style('font-family', 'Arial');
        numGroupsInput.style('width', '92px');

        clearPointsButton = p5.createButton('Clear Points');
        clearPointsButton.position(10, canvas.height - 30);
        clearPointsButton.mousePressed(() => {
            points = [];
            groups = [];
        });

        clearImageButton = p5.createButton('Clear Image');
        clearImageButton.position(10, canvas.height - 2);
        clearImageButton.mousePressed(() => {
            uploadedImage = null;
        });

        clearAllButton = p5.createButton('Clear All');
        clearAllButton.position(10, canvas.height + 25);
        clearAllButton.mousePressed(() => {
            points = [];
            groups = [];
            uploadedImage = null;
        });

        sizeSlider = p5.createSlider(5, 50, 20);
        sizeSlider.position(10, 150);
        sliderLabel = p5.createP('Point Size');
        sliderLabel.position(10, 120);
        sliderLabel.style('font-size', '12px');
        sliderLabel.style('font-family', 'Arial');

        let fileInput = p5.createFileInput(handleFile);
        fileInput.position(10, 200);
        fileInput.style('display', 'none');
        fileInputButton = p5.createButton('Upload Image');
        fileInputButton.position(10, 180);
        fileInputButton.mousePressed(() => fileInput.elt.click());

        let increment = 2;
        for (let index = 0; index < colours.length; index++) {
            let text = p5.createP(`Group ${index + 1}`);
            text.id(`group-label-${index}`); // Assign a unique ID
            text.position(canvas.width + 130, (increment += 32));
            text.style('font-size', '16px');
            text.style('background-color', colours[index]);
            text.style('padding', '5px');
            text.style('border-radius', '5px');
            text.style('font-weight', 'bold');
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
    
                let increment = 2;
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

        if (groups.length > 0) {
            groups.forEach((group, index) => {
                group.forEach(point => {
                    p5.fill(colours[index]);
                    p5.ellipse(point[0], point[1], ellipseSize, ellipseSize);
                });
            });
        } else {
            points.forEach(point => {
                p5.fill('black');
                p5.ellipse(point[0], point[1], ellipseSize, ellipseSize);
            });
        }
    };

    p5.mousePressed = () => {
        if (p5.mouseX >= 0 && p5.mouseX <= p5.width && p5.mouseY >= 0 && p5.mouseY <= p5.height) {
            points.push([p5.mouseX, p5.mouseY]);
            groups = [];
        }
    };

    p5.myCustomRedrawAccordingToNewPropsHandler = (newProps) => {
        if (canvas) // Make sure the canvas has been created
            p5.fill(newProps.color);
    };
}

// array of colours for each group
let colours = ['#E6194B', '#3CB44B', '#FFE119', '#4363D8', '#F58231', '#911EB4', '#42D4F4', '#F032E6', '#BFEF45', '#FABED4', '#469990', '#DCBEFF'];