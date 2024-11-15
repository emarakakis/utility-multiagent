const CAR_DATABASE = "./carDatabase.txt"
const cars = []
const utilityCars = []
let controler = false

console.log(calculateSpeedUtility(280))


document.getElementById("send-form").addEventListener("click", async function(event) {
    event.preventDefault(); // Prevent form submission (page reload)
    cars.splice(0,cars.length)
    utilityCars.splice(0,utilityCars.length)
    const accelerationWeight = parseFloat(document.getElementById("acceleration-weight").value);
    const speedWeight = parseFloat(document.getElementById("speed-weight").value);
    const modelWeight = parseFloat(document.getElementById("model-weight").value);
    const engineWeight = parseFloat(document.getElementById("engine-weight").value);
    const colourWeight = parseFloat(document.getElementById("colour-weight").value);
    
    const weights = {accelerationWeight, speedWeight, modelWeight, engineWeight, colourWeight}
    // Collect form data
    const acceleration = document.querySelector('input[name="acceleration"]:checked').value;
    const speed = document.querySelector('input[name="speed"]:checked').value;
    const model = document.querySelector('input[name="model"]:checked').value;
    const engine = document.querySelector('input[name="engine"]:checked').value;
    const colour = document.querySelector('input[name="colour"]:checked').value;

    // Display the collected form data
    const formData = {
        acceleration,
        speed,
        model,
        engine,
        colour
    };

    let fileContents = '';
    const fileInput = document.getElementById("document-upload")

    // Load car database
    if (!fileInput.files[0]) {
        window.alert("You forgot to load the Database")
        return
    } else 
    // Make sure to use async/await for file reading
    await new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(progressEvent) {
            const text = this.result;
            const lines = text.split('\n');
            for (const line of lines) {
                if (addCar(line) == -1){
                    controler = true;
                    return
                }
            }
            resolve(); // Resolve when file processing is done
        };

        reader.onerror = function(error) {
            reject("Failed to read file: " + error);
        };

        reader.readAsText(fileInput.files[0]); // Read file as text
    });
    console.log(cars)
    judgeCars(formData, weights)
});

function judgeCars(form, weights){
    for (const car of cars) {    
        let carUtility = 0;
        
        const accelerationUtility = getAccelerationUtility(car, car.acceleration, form);
        carUtility += accelerationUtility * weights.accelerationWeight;

        const speedUtility = getSpeedUtility(car, car.speed, form);
        carUtility += speedUtility * weights.speedWeight;

        const modelUtility = getModelUtility(car, car.model, form);
        carUtility += modelUtility * weights.modelWeight;

        const engineUtility = getEngineUtility(car, car.engine, form);
        carUtility += engineUtility * weights.engineWeight;

        const colourUtility = getColourUtility(car, car.colour, form)
        carUtility += colourUtility * weights.colourWeight;

        utilityCars.push({ name: car.name, utility: carUtility });
    }

    utilityCars.sort((a, b) => b.utility - a.utility);

    updateCarDisplay()
}

function addCar(line) {
    if (!line){
        return
    }
    const car = line.split('|');
    if (car.length != 6) {
        window.alert(`Error in database, at line:\n${line}\nRemember each car needs to have this template:\n carName|acceleration|maxSpeed|model|engine|colour\n\nStopping the execution`);
        window.location.href = '#';  // Redirect the page
        return -1;  // Immediately stop the function execution
    }
    const carColour = car[5].split("\r")[0]
    cars.push({
        name: car[0],
        acceleration: calculateAccelerationUtility(Number(car[1])),
        speed: calculateSpeedUtility(Number(car[2])),
        model: calculateModelUtility(car[3]),
        engine: calculateEngineUtility(car[4]),
        colour: carColour
    });
}

function calculateAccelerationUtility(acceleration) {
    if (acceleration < 4) acceleration = 4;
    if (acceleration > 12) acceleration = 12;


    
    // Calculate rank on a scale of 0 to 10 (inverted scale)
    return ((12 - acceleration) / (12 - 4)) * 10;
}

function calculateSpeedUtility(speed) {
    // Ensure the speed is within bounds
    if (speed < 150) speed = 150;
    if (speed > 350) speed = 350;

    // Calculate rank on a scale of 0 to 10
    return ((speed - 150) / 200) * 10;
}

function calculateModelUtility(model) {

    switch(model.toLowerCase()) {
        case "sports":
            return 10;
        case "convertible":
            return 7.5;
        case "pickup":
            return 5;
        case "suv":
            return 2.5;
        case "city":
            return 0;
        default:
            return -1; // Default case for undefined models
    }
}

function calculateEngineUtility(engine) {
    switch(engine.toLowerCase()) {
        case "electric":
            return 10;
        case "hybrid":
            return 7.5;
        case "petrol":
            return 2.5;
        case "diesel":
            return 0;
        default:
            return -1; // Default case for undefined models
    }
}

function getColourUtility(car, colour, form) {
    return colour.toLowerCase() === form.colour.toLowerCase() ? 1 : 0
}

function getAccelerationUtility(car, acceleration, form) {
    const givenAcceleration = calculateAccelerationUtility(Number(form.acceleration)); // Make sure speed is trimmed and lowercase
    return utilityMiddleGivenValue(acceleration,givenAcceleration, 4)
}

function getSpeedUtility(car, speed, form) {
    const givenSpeed = calculateSpeedUtility(Number(form.speed)); // Make sure speed is trimmed and lowercase
    return utilityMiddleGivenValue(speed,givenSpeed, 4)
}

function getModelUtility(car, model, form) {
    const userModelPreference = form.model;
    
    switch (userModelPreference) {
        case "sports":
            return utilityBigValues(model) 
        case "suv":
            return utilityMiddleSmallValues(model) 
        case "pickup":
            return utilityMiddleValues(model)  
        case "sedan":
            return utilityMiddleBigValues(model)
        case "city":
            return utilitySmallValues(model)
        default:
            return 0;
    }
}

function getEngineUtility(car, engine, form) {
    const userEnginePreference = form.engine; // User's engine preference (e.g., "electric", "hybrid", "diesel", "petrol")
    switch (userEnginePreference) {
        case "electric":
            return utilityBigValues(engine)
        case "hybrid":
            return utilityMiddleBigValues(engine)
        case "diesel":
            return utilitySmallValues(engine)
        case "petrol":
            return utilityMiddleSmallValues(engine)
        default:
            return 0;
    }
}


function utilitySmallValues(value){
    return 10 - value
}

function utilityBigValues(value){
    return value
}

        
function utilityMiddleValues(value) {
    return Math.max(0, 10 - Math.pow(value - 5, 2) / 4);  
}

function utilityMiddleGivenValue(value, Mid, divisor){
    return Math.max(0, 10 - Math.pow(value - Mid, 2) / divisor);
}

function utilityMiddleBigValues(value) {
    return Math.max(0, 10 - Math.pow(value - 7.5, 2) / 4);  
}

function utilityMiddleSmallValues(value) {
    return Math.max(0, 10 - Math.pow(value - 2.5, 2) / 4);  
}


function utilityIndeferent(value){
    return 5;
}

function updateCarDisplay() {
    // Find the container where you want to display the results
    const resultsContainer = document.getElementById("car-results");
    
    // Clear any previous results
    resultsContainer.innerHTML = "";
    let index = 1;
    // Loop through the sorted cars in utilityCars
    utilityCars.forEach(car => {
        // Create a new div element for each car and its utility score
        const carDiv = document.createElement("div");
        carDiv.classList.add("car-result");

        // Set the inner HTML with car name and utility score
        carDiv.innerHTML = `
            <strong>${index}.${car.name}</strong>: <span>${car.utility.toFixed(2)}</span>
        `;
        index++;
        // Append the div to the results container
        resultsContainer.appendChild(carDiv);
    });
}

