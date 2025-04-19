
        // Fodder nutrition data (per kg dry matter)
        const fodderData = {
            alfalfa_hay: {
                name: "Alfalfa Hay",
                dm: 0.90, // Dry matter percentage
                cp: 0.18, // Crude protein
                ndf: 0.40, // Neutral detergent fiber
                adf: 0.30, // Acid detergent fiber
                tdn: 0.58, // Total digestible nutrients
                nel: 1.45, // Net energy lactation (Mcal/kg)
                ca: 0.014, // Calcium
                p: 0.0025, // Phosphorus
                milkFactor: 1.6, // Milk production factor
                cost: 44 // Cost per kg in kenys shillings
            },
            grass_hay: {
                name: "Grass Hay",
                dm: 0.88,
                cp: 0.12,
                ndf: 0.58,
                adf: 0.38,
                tdn: 0.54,
                nel: 1.25,
                ca: 0.006,
                p: 0.0025,
                milkFactor: 1.3,
                cost: 36
            },
            corn_silage: {
                name: "Corn Silage",
                dm: 0.35,
                cp: 0.08,
                ndf: 0.45,
                adf: 0.28,
                tdn: 0.70,
                nel: 1.65,
                ca: 0.0028,
                p: 0.0022,
                milkFactor: 1.8,
                cost: 0.30
            },
            grain_mix: {
                name: "Grain Mix/Concentrate",
                dm: 0.89,
                cp: 0.20,
                ndf: 0.20,
                adf: 0.10,
                tdn: 0.80,
                nel: 1.90,
                ca: 0.008,
                p: 0.005,
                milkFactor: 2.3,
                cost: 0.70
            },
            pasture: {
                name: "Pasture",
                dm: 0.25,
                cp: 0.20,
                ndf: 0.45,
                adf: 0.25,
                tdn: 0.65,
                nel: 1.60,
                ca: 0.007,
                p: 0.0035,
                milkFactor: 1.7,
                cost: 20
            },
            soybean_meal: {
                name: "Soybean Meal",
                dm: 0.90,
                cp: 0.48,
                ndf: 0.15,
                adf: 0.08,
                tdn: 0.84,
                nel: 1.95,
                ca: 0.003,
                p: 0.007,
                milkFactor: 2.2,
                cost: 90
            },
            cottonseed: {
                name: "Cottonseed",
                dm: 0.92,
                cp: 0.23,
                ndf: 0.40,
                adf: 0.30,
                tdn: 0.85,
                nel: 2.05,
                ca: 0.0016,
                p: 0.006,
                milkFactor: 2.0,
                cost: 56
            },
            beet_pulp: {
                name: "Beet Pulp",
                dm: 0.90,
                cp: 0.09,
                ndf: 0.40,
                adf: 0.24,
                tdn: 0.76,
                nel: 1.80,
                ca: 0.006,
                p: 0.001,
                milkFactor: 1.8,
                cost: 50
            },
            other: {
                name: "Other",
                dm: 0.85,
                cp: 0.15,
                ndf: 0.40,
                adf: 0.25,
                tdn: 0.65,
                nel: 1.55,
                ca: 0.006,
                p: 0.003,
                milkFactor: 1.5,
                cost: 40
            }
        };
        
        // Breed production multipliers
        const breedMultipliers = {
            holstein: 1.0,
            jersey: 0.8,  // Lower volume but higher fat
            brownswiss: 0.9,
            guernsey: 0.85,
            ayrshire: 0.9,
            other: 0.85
        };
        
        // Lactation stage multipliers
        const lactationMultipliers = {
            early: 1.2,  // Peak production
            mid: 1.0,    // Standard
            late: 0.8,   // Declining
            mixed: 1.0   // Average
        };
        
        // Nutrient requirements based on cow weight and milk production
        function getNutrientRequirements(weight, milkProduction, lactationStage) {
            const baseNEL = 0.08 * Math.pow(weight, 0.75); // Maintenance NEL requirement (Mcal/day)
            const milkNEL = 0.75 * milkProduction; // NEL for milk production
            
            let requirementMultiplier = 1.0;
            if (lactationStage === 'early') requirementMultiplier = 1.1;
            if (lactationStage === 'late') requirementMultiplier = 0.9;
            
            return {
                nelTotal: (baseNEL + milkNEL) * requirementMultiplier,
                cp: (0.0038 * weight + 0.09 * milkProduction) * requirementMultiplier,
                dmi: (0.022 * weight + 0.2 * milkProduction) * 0.95, // Dry matter intake capacity
                ndf: 0.28 * (0.022 * weight + 0.2 * milkProduction), // Minimum NDF requirement
                ca: (0.000043 * weight + 0.0011 * milkProduction) * requirementMultiplier,
                p: (0.000032 * weight + 0.0009 * milkProduction) * requirementMultiplier
            };
        }
        
        // DOM elements and event listeners
        document.addEventListener('DOMContentLoaded', function() {
            const addFodderBtn = document.getElementById('addFodder');
            const fodderList = document.getElementById('fodderList');
            const calculateBtn = document.getElementById('calculateBtn');
            const resultsCard = document.getElementById('resultsCard');
            const totalMilkProduction = document.getElementById('totalMilkProduction');
            const milkPerCow = document.getElementById('milkPerCow');
            const feedEfficiency = document.getElementById('feedEfficiency');
            const nutritionTable = document.getElementById('nutritionTable');
            const recommendationsDiv = document.getElementById('recommendations');
            const scenariosTable = document.getElementById('scenariosTable');
            
            // Add event listener to add fodder button
            addFodderBtn.addEventListener('click', addFodderItem);
            
            // Add event listeners to remove buttons
            addRemoveFodderListeners();
            
            // Add event listener to calculate button
            calculateBtn.addEventListener('click', calculateMilkProduction);
            
            function addFodderItem() {
                const template = document.querySelector('.fodder-template').children[0];
                const newItem = template.cloneNode(true);
                fodderList.appendChild(newItem);
                addRemoveFodderListeners();
            }
            
            function addRemoveFodderListeners() {
                document.querySelectorAll('.remove-fodder').forEach(button => {
                    button.addEventListener('click', function() {
                        const fodderItems = document.querySelectorAll('.fodder-item');
                        if (fodderItems.length > 1) {
                            this.parentElement.remove();
                        } else {
                            alert('You must have at least one fodder item.');
                        }
                    });
                });
            }
            
            function calculateMilkProduction() {
                console.log('Starting calculateMilkProduction...');
            
                // Get farm information
                const cattleCount = parseInt(document.getElementById('cattleCount').value);
                const cattleBreed = document.getElementById('cattleBreed').value;
                const avgWeight = parseFloat(document.getElementById('avgWeight').value);
                const lactationStage = document.getElementById('lactationStage').value;
            
                // Validate inputs
                if (isNaN(cattleCount) || cattleCount <= 0) {
                    alert('Please enter a valid number of milking cows (must be greater than 0).');
                    return;
                }
                if (isNaN(avgWeight) || avgWeight < 300 || avgWeight > 900) {
                    alert('Please enter a valid average cow weight (between 300 and 900 kg).');
                    return;
                }
            
                // Get fodder inputs
                const fodderItems = document.querySelectorAll('.fodder-item');
                if (fodderItems.length === 0) {
                    alert('You must add at least one fodder crop.');
                    return; // Exit if no fodder crops are added
                }
            
                const fodderInputs = [];
                let totalDryMatter = 0;
                let totalNutrients = {
                    nel: 0,
                    cp: 0,
                    ndf: 0,
                    adf: 0,
                    tdn: 0,
                    ca: 0,
                    p: 0
                };
                let totalMilkFactor = 0;
                let totalFeedCost = 0;
            
                fodderItems.forEach(item => {
                    const fodderType = item.querySelector('.fodder-type').value;
                    const fodderAmount = parseFloat(item.querySelector('.fodder-amount').value);
            
                    // Validate fodder amount
                    if (isNaN(fodderAmount)) {
                        alert('Please enter a valid amount for all fodder types.');
                        return;
                    }
                    if (fodderAmount < 0) {
                        alert('Fodder amounts cannot be negative.');
                        return;
                    }
            
                    const fodder = fodderData[fodderType];
                    const dryMatterAmount = fodderAmount * fodder.dm;
            
                    totalDryMatter += dryMatterAmount;
                    totalNutrients.nel += dryMatterAmount * fodder.nel;
                    totalNutrients.cp += dryMatterAmount * fodder.cp;
                    totalNutrients.ndf += dryMatterAmount * fodder.ndf;
                    totalNutrients.adf += dryMatterAmount * fodder.adf;
                    totalNutrients.tdn += dryMatterAmount * fodder.tdn;
                    totalNutrients.ca += dryMatterAmount * fodder.ca;
                    totalNutrients.p += dryMatterAmount * fodder.p;
            
                    totalMilkFactor += dryMatterAmount * fodder.milkFactor;
                    totalFeedCost += fodderAmount * fodder.cost;
            
                    fodderInputs.push({
                        type: fodderType,
                        name: fodder.name,
                        amount: fodderAmount,
                        dryMatter: dryMatterAmount
                    });
                });
            
                // Debugging: Log calculated values
                console.log('Total Dry Matter:', totalDryMatter);
                console.log('Total Nutrients:', totalNutrients);
                console.log('Total Feed Cost:', totalFeedCost);
            
                // Calculate milk production
                const feedQualityFactor = totalMilkFactor / totalDryMatter;
                const feedQuantityFactor = totalDryMatter * 0.8;
                const breedFactor = breedMultipliers[cattleBreed];
                const stageFactor = lactationMultipliers[lactationStage];
            
                let milkYieldPerCow = feedQualityFactor * feedQuantityFactor * breedFactor * stageFactor;
            
                // Adjust based on nutrient limitations
                const energyBasedMilk = totalNutrients.nel / 0.75; // Assuming 0.75 Mcal NEL per liter of milk
                const proteinBasedMilk = totalNutrients.cp / 0.09; // Assuming 90g protein per liter of milk
            
                milkYieldPerCow = Math.min(milkYieldPerCow, energyBasedMilk, proteinBasedMilk);
            
                // Calculate total milk production
                const totalMilk = milkYieldPerCow * cattleCount;
            
                // Calculate efficiency
                const efficiency = milkYieldPerCow / totalDryMatter;
            
                // Calculate nutrient requirements based on the estimated milk production
                const requirements = getNutrientRequirements(avgWeight, milkYieldPerCow, lactationStage);
            
                // Debugging: Log milk production and requirements
                console.log('Milk Yield Per Cow:', milkYieldPerCow);
                console.log('Total Milk Production:', totalMilk);
                console.log('Feed Efficiency:', efficiency);
                console.log('Nutrient Requirements:', requirements);
            
                // Display results
                resultsCard.style.display = 'block';
                totalMilkProduction.textContent = `${totalMilk.toFixed(1)} liters`;
                milkPerCow.textContent = `${milkYieldPerCow.toFixed(1)} liters/cow`;
                feedEfficiency.textContent = `${efficiency.toFixed(2)} liters/kg DM`;
            
                // Update nutrition table
                nutritionTable.innerHTML = '';
            
                // Add rows to nutrition table
                const dryMatterStatus = getStatusClass(totalDryMatter, requirements.dmi, 0.9, 1.1);
                addNutritionRow('Dry Matter Intake', totalDryMatter.toFixed(1) + ' kg', requirements.dmi.toFixed(1) + ' kg', dryMatterStatus);
            
                const nelStatus = getStatusClass(totalNutrients.nel, requirements.nelTotal, 0.95, 1.05);
                addNutritionRow('Net Energy (NEL)', totalNutrients.nel.toFixed(1) + ' Mcal', requirements.nelTotal.toFixed(1) + ' Mcal', nelStatus);
            
                const cpStatus = getStatusClass(totalNutrients.cp, requirements.cp, 0.95, 1.1);
                addNutritionRow('Crude Protein', (totalNutrients.cp * 1000).toFixed(0) + ' g', (requirements.cp * 1000).toFixed(0) + ' g', cpStatus);
            
                const ndfRatio = totalDryMatter === 0 ? 0 : totalNutrients.ndf / totalDryMatter;
                const ndfStatus = getNDFStatusClass(ndfRatio);
                addNutritionRow('NDF', (totalNutrients.ndf * 100).toFixed(1) + '%', (requirements.ndf * 100 / totalDryMatter).toFixed(1) + '%', ndfStatus);
                const caStatus = getStatusClass(totalNutrients.ca, requirements.ca, 0.8, 1.5);
                addNutritionRow('Calcium', (totalNutrients.ca * 1000).toFixed(1) + ' g', (requirements.ca * 1000).toFixed(1) + ' g', caStatus);
            
                const pStatus = getStatusClass(totalNutrients.p, requirements.p, 0.8, 1.5);
                addNutritionRow('Phosphorus', (totalNutrients.p * 1000).toFixed(1) + ' g', (requirements.p * 1000).toFixed(1) + ' g', pStatus);
            
                // Generate recommendations
                console.log('Calling generateRecommendations...');
                generateRecommendations(totalNutrients, requirements, totalDryMatter, milkYieldPerCow, fodderInputs, totalFeedCost);
                console.log('generateRecommendations called successfully.');
            
                // Generate optimization scenarios
                console.log('Calling generateScenarios...');
                generateScenarios(totalMilk, cattleCount, totalFeedCost, milkYieldPerCow, fodderInputs, requirements);
                console.log('generateScenarios called successfully.');
            }
            
            function addNutritionRow(nutrient, amount, requirement, status) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${nutrient}</td>
                    <td>${amount}</td>
                    <td>${requirement}</td>
                    <td class="${status.className}">${status.text}</td>
                `;
                document.getElementById('nutritionTable').appendChild(row);
            }
            
            function getStatusClass(actual, required, lowerThreshold, upperThreshold) {
                if (actual === 0 || required === 0) {
                    return {
                        className: 'text-danger',
                        text: 'No Data - Add fodder crops'
                    };
                } else if (actual < required * lowerThreshold) {
                    return {
                        className: 'text-danger',
                        text: 'Too Low'
                    };
                } else if (actual > required * upperThreshold) {
                    return {
                        className: 'text-warning',
                        text: 'Too High'
                    };
                } else {
                    return {
                        className: 'text-success',
                        text: 'Optimal'
                    };
                }
            }
            
            function getNDFStatusClass(ndfRatio) {
                if (ndfRatio < 0.25) {
                    return {
                        className: 'text-danger',
                        text: 'Too Low - Risk of acidosis'
                    };
                } else if (ndfRatio > 0.45) {
                    return {
                        className: 'text-warning',
                        text: 'Too High - May limit intake'
                    };
                } else {
                    return {
                        className: 'text-success',
                        text: 'Optimal'
                    };
                }
            }
            
            function generateRecommendations(totalNutrients, requirements, totalDryMatter, milkYieldPerCow, fodderInputs, totalFeedCost) {
                const recommendations = document.getElementById('recommendations');
                recommendations.innerHTML = '<h4>Recommendations:</h4><ul>';
            
                if (totalNutrients.cp < requirements.cp * 0.95) {
                    recommendations.innerHTML += '<li>Increase protein sources in the diet (e.g., soybean meal, cottonseed).</li>';
                }
                if (totalNutrients.nel < requirements.nelTotal * 0.95) {
                    recommendations.innerHTML += '<li>Increase energy-dense feeds (e.g., grain mix, corn silage).</li>';
                }
                if (totalNutrients.ndf / totalDryMatter < 0.25) {
                    recommendations.innerHTML += '<li>Increase fiber levels (e.g., grass hay, beet pulp).</li>';
                }
            
                // Add a recommendation based on feed cost
                if (totalFeedCost > 20000) { // Example threshold
                    recommendations.innerHTML += '<li>Consider reducing feed costs by optimizing fodder combinations.</li>';
                }
            
                recommendations.innerHTML += '</ul>';
            }
            
            function generateScenarios(totalMilk, cattleCount, totalFeedCost, milkYieldPerCow, fodderInputs, requirements) {
                const scenariosTable = document.getElementById('scenariosTable');
                scenariosTable.innerHTML = ''; // Clear existing content
            
                // Scenario 1: Increase energy-dense feeds
                const scenario1Milk = milkYieldPerCow * 1.1; // 10% increase
                const scenario1Cost = totalFeedCost * 1.05; // 5% increase
                const scenario1Profit = (scenario1Milk * cattleCount * 50) - scenario1Cost; // Assuming 50 KES per liter profit
            
                // Scenario 2: Increase protein sources
                const scenario2Milk = milkYieldPerCow * 1.05; // 5% increase
                const scenario2Cost = totalFeedCost * 1.03; // 3% increase
                const scenario2Profit = (scenario2Milk * cattleCount * 50) - scenario2Cost;
            
                // Scenario 3: Optimize fiber levels
                const scenario3Milk = milkYieldPerCow * 1.03; // 3% increase
                const scenario3Cost = totalFeedCost * 0.98; // 2% decrease
                const scenario3Profit = (scenario3Milk * cattleCount * 50) - scenario3Cost;
            
                // Add rows to the table
                addScenarioRow(scenariosTable, 'Increase Energy-Dense Feeds', scenario1Milk.toFixed(1), scenario1Cost.toFixed(2), scenario1Profit.toFixed(2));
                addScenarioRow(scenariosTable, 'Increase Protein Sources', scenario2Milk.toFixed(1), scenario2Cost.toFixed(2), scenario2Profit.toFixed(2));
                addScenarioRow(scenariosTable, 'Optimize Fiber Levels', scenario3Milk.toFixed(1), scenario3Cost.toFixed(2), scenario3Profit.toFixed(2));
            }
            
            // Helper function to add a row to the scenarios table
            function addScenarioRow(table, scenario, milkProduction, feedCost, profit) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${scenario}</td>
                    <td>${milkProduction} liters/cow</td>
                    <td>KES ${feedCost}</td>
                    <td>KES ${profit}</td>
                `;
                table.appendChild(row);
            };
        });
    
