// State object to keep track of excluded sections
const excludedSections = {
    generalDataSection: false,
    wallsPlasterSection: false,
    paintSection: false,
    foundationsSection: false,
    structureMainSection: false, // The main container for structure, won't be toggled directly
    roofSection: false, // New sub-section
    columnsSection: false, // New sub-section
    beamsSection: false, // New sub-section
    pricesWasteSection: false,
    finishingSection: false // New finishing section
};

function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const button = section.querySelector('.toggle-button');
    const inputs = section.querySelectorAll('input');

    if (excludedSections[sectionId]) {
        // Section is currently excluded, include it
        section.classList.remove('excluded');
        button.textContent = 'استبعاد';
        button.classList.remove('included');
        inputs.forEach(input => input.removeAttribute('disabled'));
        excludedSections[sectionId] = false;
    } else {
        // Section is currently included, include it
        section.classList.add('excluded');
        button.textContent = 'تضمين';
        button.classList.add('included');
        inputs.forEach(input => input.setAttribute('disabled', 'true'));
        excludedSections[sectionId] = true;
    }
    calculateMaterials(); // Recalculate after toggling a section
}


function calculateMaterials() {
    // Get general building inputs
    let totalBuildingArea = parseFloat(document.getElementById('totalBuildingArea').value);
    let numberOfFloors = parseInt(document.getElementById('numberOfFloors').value);

    // Get input values for walls & plaster per floor
    let wallLengthPerFloor = parseFloat(document.getElementById('wallLength').value);
    let wallHeightPerFloor = parseFloat(document.getElementById('wallHeight').value);
    let openingAreaPerFloor = parseFloat(document.getElementById('openingArea').value); // This will be adjusted below
    let mortarThicknessBuilding = parseFloat(document.getElementById('mortarThicknessBuilding').value);
    let mortarThicknessPlaster = parseFloat(document.getElementById('mortarThicknessPlaster').value);
    let sandRatioBuilding = parseFloat(document.getElementById('sandRatioBuilding').value);
    let cementRatioBuilding = parseFloat(document.getElementById('cementRatioBuilding').value);
    let sandRatioPlaster = parseFloat(document.getElementById('sandRatioPlaster').value);
    let cementRatioPlaster = parseFloat(document.getElementById('cementRatioPlaster').value);
    
    // Get input values for paint
    let paintCoverage = parseFloat(document.getElementById('paintCoverage').value);
    let paintCoats = parseFloat(document.getElementById('paintCoats').value);

    // Get input values for Foundations
    let foundationAreaCoverage = parseFloat(document.getElementById('foundationAreaCoverage').value) / 100; // Convert to decimal
    let foundationDepth = parseFloat(document.getElementById('foundationDepth').value);
    let steelConsumptionFoundations = parseFloat(document.getElementById('steelConsumptionFoundations').value);

    // Get input values for concrete ratios (from main structure section)
    let cementRatioConcrete = parseFloat(document.getElementById('cementRatioConcrete').value);
    let sandRatioConcrete = parseFloat(document.getElementById('sandRatioConcrete').value);
    let gravelRatioConcrete = parseFloat(document.getElementById('gravelRatioConcrete').value);

    // Get input values for roof (from sub-section)
    let roofPercentage = parseFloat(document.getElementById('roofPercentage').value);
    let slabThickness = parseFloat(document.getElementById('slabThickness').value);
    let steelConsumptionSlab = parseFloat(document.getElementById('steelConsumptionSlab').value);

    // Get input values for columns (from sub-section)
    let concreteVolColumnsPerM2 = parseFloat(document.getElementById('concreteVolColumnsPerM2').value);
    let steelConsumptionColumns = parseFloat(document.getElementById('steelConsumptionColumns').value);

    // Get input values for beams (from sub-section)
    let concreteVolBeamsPerM2 = parseFloat(document.getElementById('concreteVolBeamsPerM2').value);
    let steelConsumptionBeams = parseFloat(document.getElementById('steelConsumptionBeams').value);

    // Get input values for prices
    let priceBlock = parseFloat(document.getElementById('priceBlock').value);
    let priceSand = parseFloat(document.getElementById('priceSand').value);
    let priceCementBag = parseFloat(document.getElementById('priceCementBag').value);
    let priceSteel = parseFloat(document.getElementById('priceSteel').value);
    let priceGravel = parseFloat(document.getElementById('priceGravel').value);
    let pricePaint = parseFloat(document.getElementById('pricePaint').value);

    // Get new specific labor costs
    let laborCostCarpentryM2 = parseFloat(document.getElementById('laborCostCarpentryM2').value); // New
    let laborCostBlacksmithM2 = parseFloat(document.getElementById('laborCostBlacksmithM2').value); // New
    let laborCostConcreteCastingM2 = parseFloat(document.getElementById('laborCostConcreteCastingM2').value); // New
    let laborCostOtherPerM2 = parseFloat(document.getElementById('laborCostOtherPerM2').value); // Modified

    // Get input values for waste percentages (convert to decimal)
    let wastePercentageBlocks = parseFloat(document.getElementById('wastePercentageBlocks').value) / 100;
    let wastePercentageMortar = parseFloat(document.getElementById('wastePercentageMortar').value) / 100;
    let wastePercentageSteel = parseFloat(document.getElementById('wastePercentageSteel').value) / 100;
    let wastePercentagePaint = parseFloat(document.getElementById('wastePercentagePaint').value) / 100;

    // Get input values for Finishing
    let costPerM2Flooring = parseFloat(document.getElementById('costPerM2Flooring').value);
    let numberOfDoors = parseFloat(document.getElementById('numberOfDoors').value);
    let pricePerDoor = parseFloat(document.getElementById('pricePerDoor').value);
    let numberOfWindows = parseFloat(document.getElementById('numberOfWindows').value);
    let pricePerWindow = parseFloat(document.getElementById('pricePerWindow').value);
    let costPerM2Electrical = parseFloat(document.getElementById('costPerM2Electrical').value);
    let costPerM2Plumbing = parseFloat(document.getElementById('costPerM2Plumbing').value);
    let costPerM2Carpentry = parseFloat(document.getElementById('costPerM2Carpentry').value);
    let costPerM2Blacksmith = parseFloat(document.getElementById('costPerM2Blacksmith').value);


    // Fixed constants
    const blockThickness = 0.15; // 15 cm
    const blockLength = 0.40; // 40 cm
    const blockHeight = 0.20; // 20 cm
    const cementBagVolume = 0.0347; // Approx. volume of a 50kg cement bag in m^3

    // --- Initialize ALL Quantities and Costs ---
    // Section: Foundations
    let foundationsConcreteVolume = 0;
    let foundationsSteel = 0;
    let foundationsSand = 0;
    let foundationsGravel = 0;
    let foundationsCementBags = 0;
    let costFoundationsSand = 0;
    let costFoundationsGravel = 0;
    let costFoundationsCement = 0;
    let costFoundationsSteel = 0;
    let costFoundationsTotal = 0;

    // Section: Walls (Block Building)
    let totalBlocks = 0;
    let buildingSand = 0;
    let buildingCementBags = 0;
    let costBlocks = 0;
    let costBuildingSand = 0;
    let costBuildingCement = 0;
    let costBlocksAndBuildingMortarTotal = 0;

    // Section: Plastering (Lebkh)
    let plasterSand = 0;
    let plasterCementBags = 0;
    let costPlasterSand = 0;
    let costPlasterCement = 0;
    let costPlasterMortarTotal = 0;

    // Section: Structure (Slabs, Columns, Beams) - Accumulators
    let totalRoofArea = 0; // Accumulated roof area across all floors (for reporting)
    let structureConcreteVolume = 0; // Total concrete volume for slabs, columns, beams
    let structureSteel = 0;
    let structureSand = 0;
    let structureGravel = 0;
    let structureCementBags = 0;
    let costStructureSand = 0;
    let costStructureGravel = 0;
    let costStructureCement = 0;
    let costStructureSteel = 0;
    let costStructureConcreteAndSteelTotal = 0;

    // Section: Paint
    let totalPaintLiters = 0;
    let costPaintMaterial = 0;
    let costPaintTotal = 0;

    // Section: Labor Costs (NEW BREAKDOWN)
    let costLaborCarpentry = 0; // Labor for formwork (نجارة)
    let costLaborBlacksmith = 0; // Labor for rebar fixing (حدادة)
    let costLaborConcreteCasting = 0; // Labor for concrete pouring (صب الخرسانة)
    let costLaborOther = 0; // Other general labor
    let totalDirectLaborCost = 0;

    // Section: Finishing
    let costFlooringTotal = 0;
    let costDoorsTotal = 0;
    let costWindowsTotal = 0;
    let costElectricalTotal = 0;
    let costPlumbingTotal = 0;
    let costCarpentryTotal = 0;
    let costBlacksmithTotal = 0;
    let costFinishingTotal = 0;


    // Overall Totals
    let overallTotalSand = 0;
    let overallTotalCementBags = 0;
    let overallTotalGravel = 0;
    let overallTotalSteel = 0;
    let totalMaterialCost = 0;
    let estimatedLaborCost = 0; // This will now sum all individual labor costs
    let overallTotalCost = 0;


    // --- Apply Exclude Logic to Inputs and Calculations ---
    if (excludedSections.generalDataSection) {
        totalBuildingArea = 0;
        numberOfFloors = 0;
    }

    if (excludedSections.pricesWasteSection) {
        priceBlock = 0;
        priceSand = 0;
        priceCementBag = 0;
        priceSteel = 0;
        priceGravel = 0;
        pricePaint = 0;
        // Set all specific labor costs to zero as well if section is excluded
        laborCostCarpentryM2 = 0;
        laborCostBlacksmithM2 = 0;
        laborCostConcreteCastingM2 = 0;
        laborCostOtherPerM2 = 0;

        wastePercentageBlocks = 0;
        wastePercentageMortar = 0;
        wastePercentageSteel = 0;
        wastePercentagePaint = 0;
    }
    
    if (excludedSections.finishingSection) {
        costPerM2Flooring = 0;
        numberOfDoors = 0;
        pricePerDoor = 0;
        numberOfWindows = 0;
        pricePerWindow = 0;
        costPerM2Electrical = 0;
        costPerM2Plumbing = 0;
        costPerM2Carpentry = 0;
        costPerM2Blacksmith = 0;
    }


    // --- 1. Calculations for Foundations (Only for the ground floor / building footprint) ---
    if (!excludedSections.foundationsSection) {
        const baseFoundationsConcreteVolume = totalBuildingArea * foundationAreaCoverage * foundationDepth;
        const actualFoundationsConcreteVolume = baseFoundationsConcreteVolume * (1 + wastePercentageMortar); // Apply mortar waste for concrete
        foundationsConcreteVolume = actualFoundationsConcreteVolume; // Assign to specific variable for display

        foundationsSteel = (actualFoundationsConcreteVolume * steelConsumptionFoundations) * (1 + wastePercentageSteel); // Apply steel waste separately

        const totalPartsConcrete = cementRatioConcrete + sandRatioConcrete + gravelRatioConcrete;
        if (totalPartsConcrete > 0) {
            foundationsSand = (sandRatioConcrete / totalPartsConcrete) * actualFoundationsConcreteVolume;
            foundationsGravel = (gravelRatioConcrete / totalPartsConcrete) * actualFoundationsConcreteVolume;
            const cementVolumeFoundations = (cementRatioConcrete / totalPartsConcrete) * actualFoundationsConcreteVolume;
            foundationsCementBags = Math.ceil(cementVolumeFoundations / cementBagVolume);
        }

        // Costs for Foundations Materials
        costFoundationsSand = foundationsSand * priceSand;
        costFoundationsGravel = foundationsGravel * priceGravel;
        costFoundationsCement = foundationsCementBags * priceCementBag;
        costFoundationsSteel = foundationsSteel * priceSteel;
        costFoundationsTotal = costFoundationsSand + costFoundationsGravel + costFoundationsCement + costFoundationsSteel;

        // Add foundation footprint to carpentry/blacksmith/casting labor areas
        const foundationsFootprintArea = totalBuildingArea * foundationAreaCoverage;
        totalCarpentryLaborArea += foundationsFootprintArea; // Assuming formwork for foundations walls/footings
        totalBlacksmithLaborArea += foundationsFootprintArea; // Assuming rebar for foundations
        totalConcreteCastingLaborArea += foundationsFootprintArea; // Assuming pouring for foundations
    }


    // --- Accumulators for Labor based on floor areas ---
    // These were initialized to 0, and foundations added above. Now for floors.
    let totalOtherLaborArea = 0; // For other general labor


    // --- 2. Calculate quantities and costs for EACH FLOOR (Walls, Plaster, Structure, Finishing) ---
    if (!excludedSections.generalDataSection && numberOfFloors > 0) {
        for (let i = 0; i < numberOfFloors; i++) {
            // --- Walls (Block Building) ---
            if (!excludedSections.wallsPlasterSection) {
                const totalWallAreaPerFloor = wallLengthPerFloor * wallHeightPerFloor;
                
                const netWallAreaPerFloor = totalWallAreaPerFloor - openingAreaPerFloor;

                const blockAreaWithMortar = (blockLength + mortarThicknessBuilding) * (blockHeight + mortarThicknessBuilding);
                const baseRequiredBlocksPerFloor = netWallAreaPerFloor / blockAreaWithMortar;
                const requiredBlocksPerFloor = Math.ceil(baseRequiredBlocksPerFloor * (1 + wastePercentageBlocks));
                totalBlocks += requiredBlocksPerFloor;

                const blockNetArea = blockLength * blockHeight;
                const buildingMortarVolumePerM2 = (1 - (blockNetArea / blockAreaWithMortar)) * blockThickness;
                const baseBuildingMortarVolume = buildingMortarVolumePerM2 * netWallAreaPerFloor;
                const currentFloorBuildingMortarVolume = baseBuildingMortarVolume * (1 + wastePercentageMortar);

                const totalPartsBuilding = sandRatioBuilding + cementRatioBuilding;
                if (totalPartsBuilding > 0) {
                    const currentFloorBuildingSand = (sandRatioBuilding / totalPartsBuilding) * currentFloorBuildingMortarVolume;
                    const currentFloorBuildingCementVolume = (cementRatioBuilding / totalPartsBuilding) * currentFloorBuildingMortarVolume;
                    const currentFloorBuildingCementBags = Math.ceil(currentFloorBuildingCementVolume / cementBagVolume);
                    
                    buildingSand += currentFloorBuildingSand;
                    buildingCementBags += currentFloorBuildingCementBags;
                }
            }

            // --- Plastering Mortar (Lebkh) ---
            if (!excludedSections.wallsPlasterSection) {
                const totalWallAreaPerFloor = wallLengthPerFloor * wallHeightPerFloor;
                const netWallAreaPerFloor = totalWallAreaPerFloor - openingAreaPerFloor;
                const totalPlasterAreaPerFloor = netWallAreaPerFloor * 2;
                const basePlasterMortarVolume = totalPlasterAreaPerFloor * mortarThicknessPlaster;
                const currentFloorPlasterMortarVolume = basePlasterMortarVolume * (1 + wastePercentageMortar);

                const totalPartsPlaster = sandRatioPlaster + cementRatioPlaster;
                if (totalPartsPlaster > 0) {
                    const currentFloorPlasterSand = (sandRatioPlaster / totalPartsPlaster) * currentFloorPlasterMortarVolume;
                    const currentFloorPlasterCementVolume = (cementRatioPlaster / totalPartsPlaster) * currentFloorPlasterMortarVolume;
                    const currentFloorPlasterCementBags = Math.ceil(currentFloorPlasterCementVolume / cementBagVolume);

                    plasterSand += currentFloorPlasterSand;
                    plasterCementBags += currentFloorPlasterCementBags;
                }
            }

            // --- Paint (for all plastered walls) ---
            if (!excludedSections.paintSection && !excludedSections.wallsPlasterSection) {
                const totalWallAreaPerFloor = wallLengthPerFloor * wallHeightPerFloor;
                const netWallAreaPerFloor = totalWallAreaPerFloor - openingAreaPerFloor;
                const totalPlasterAreaPerFloor = netWallAreaPerFloor * 2;
                
                const baseRequiredPaintLiters = (totalPlasterAreaPerFloor / paintCoverage) * paintCoats;
                const requiredPaintLitersPerFloor = baseRequiredPaintLiters * (1 + wastePercentagePaint);
                totalPaintLiters += requiredPaintLitersPerFloor;
            }

            // --- Structural Elements (Slab, Columns, Beams) for THIS Floor ---
            const floorRoofArea = totalBuildingArea * (roofPercentage / 100);
            totalRoofArea += floorRoofArea; 
            
            // For labor calculation, the *area of the slab* is the common measure for formwork and rebar
            totalCarpentryLaborArea += floorRoofArea;
            totalBlacksmithLaborArea += floorRoofArea;
            totalConcreteCastingLaborArea += floorRoofArea;


            // Slab Concrete (Materials)
            if (!excludedSections.roofSection) {
                const baseSlabConcreteVolume = floorRoofArea * slabThickness;
                const slabConcreteVolume = baseSlabConcreteVolume * (1 + wastePercentageMortar);
                structureConcreteVolume += slabConcreteVolume; 
                const slabSteel = (slabConcreteVolume * steelConsumptionSlab) * (1 + wastePercentageSteel);
                structureSteel += slabSteel;
            }

            // Columns Concrete (Materials)
            if (!excludedSections.columnsSection) {
                const baseColumnConcreteVolume = floorRoofArea * concreteVolColumnsPerM2;
                const columnConcreteVolume = baseColumnConcreteVolume * (1 + wastePercentageMortar);
                structureConcreteVolume += columnConcreteVolume;
                const columnSteel = (columnConcreteVolume * steelConsumptionColumns) * (1 + wastePercentageSteel);
                structureSteel += columnSteel;
            }

            // Beams Concrete (Materials)
            if (!excludedSections.beamsSection) {
                const baseBeamConcreteVolume = floorRoofArea * concreteVolBeamsPerM2;
                const beamConcreteVolume = baseBeamConcreteVolume * (1 + wastePercentageMortar);
                structureConcreteVolume += beamConcreteVolume;
                const beamSteel = (beamConcreteVolume * steelConsumptionBeams) * (1 + wastePercentageSteel);
                structureSteel += beamSteel;
            }

            // --- Finishing elements for THIS Floor ---
            if (!excludedSections.finishingSection) {
                costFlooringTotal += totalBuildingArea * (costPerM2Flooring || 0);
                costDoorsTotal += numberOfDoors * (pricePerDoor || 0);
                costWindowsTotal += numberOfWindows * (pricePerWindow || 0);
                costElectricalTotal += totalBuildingArea * (costPerM2Electrical || 0);
                costPlumbingTotal += totalBuildingArea * (costPerM2Plumbing || 0);
                costCarpentryTotal += totalBuildingArea * (costPerM2Carpentry || 0);
                costBlacksmithTotal += totalBuildingArea * (costPerM2Blacksmith || 0);
            }
            
            // Other labor is for each floor's total area
            totalOtherLaborArea += totalBuildingArea;

        } // End of loop for each floor
    }


    // --- Concrete Material Breakdown for Structure (Slabs, Columns, Beams) ---
    const totalPartsConcrete = cementRatioConcrete + sandRatioConcrete + gravelRatioConcrete;
    if (structureConcreteVolume > 0 && totalPartsConcrete > 0) {
        structureSand = (sandRatioConcrete / totalPartsConcrete) * structureConcreteVolume;
        structureGravel = (gravelRatioConcrete / totalPartsConcrete) * structureConcreteVolume;
        const cementVolumeStructure = (cementRatioConcrete / totalPartsConcrete) * structureConcreteVolume;
        structureCementBags = Math.ceil(cementVolumeStructure / cementBagVolume);
    } else {
        structureSand = 0;
        structureGravel = 0;
        structureCementBags = 0;
    }


    // --- Calculate Costs for each Section (Material-wise) ---

    // Costs for Walls (Block Building)
    costBlocks = totalBlocks * priceBlock;
    costBuildingSand = buildingSand * priceSand;
    costBuildingCement = buildingCementBags * priceCementBag;
    costBlocksAndBuildingMortarTotal = costBlocks + costBuildingSand + costBuildingCement;

    // Costs for Plastering (Lebkh)
    costPlasterSand = plasterSand * priceSand;
    costPlasterCement = plasterCementBags * priceCementBag;
    costPlasterMortarTotal = costPlasterSand + costPlasterCement;

    // Costs for Paint
    costPaintMaterial = totalPaintLiters * pricePaint;
    costPaintTotal = costPaintMaterial;

    // Costs for Structure (Slabs, Columns, Beams) Materials
    costStructureSand = structureSand * priceSand;
    costStructureGravel = structureGravel * priceGravel;
    costStructureCement = structureCementBags * priceCementBag;
    costStructureSteel = structureSteel * priceSteel;
    costStructureConcreteAndSteelTotal = costStructureSand + costStructureGravel + costStructureCement + costStructureSteel;

    // Costs for Finishing (from previous update)
    costFinishingTotal = costFlooringTotal + costDoorsTotal + costWindowsTotal + costElectricalTotal + costPlumbingTotal + costCarpentryTotal + costBlacksmithTotal;
    
    // --- NEW: Calculate Specific Labor Costs ---
    if (!excludedSections.pricesWasteSection) { // Only calculate if labor prices section is not excluded
        costLaborCarpentry = totalCarpentryLaborArea * laborCostCarpentryM2;
        costLaborBlacksmith = totalBlacksmithLaborArea * laborCostBlacksmithM2;
        costLaborConcreteCasting = totalConcreteCastingLaborArea * laborCostConcreteCastingM2;
        costLaborOther = totalOtherLaborArea * laborCostOtherPerM2;
        totalDirectLaborCost = costLaborCarpentry + costLaborBlacksmith + costLaborConcreteCasting + costLaborOther;
    } else {
        costLaborCarpentry = 0;
        costLaborBlacksmith = 0;
        costLaborConcreteCasting = 0;
        costLaborOther = 0;
        totalDirectLaborCost = 0;
    }


    // --- Overall Totals (Quantities & Costs) ---
    overallTotalSand = foundationsSand + buildingSand + plasterSand + structureSand;
    overallTotalCementBags = foundationsCementBags + buildingCementBags + plasterCementBags + structureCementBags;
    overallTotalGravel = foundationsGravel + structureGravel;
    overallTotalSteel = foundationsSteel + structureSteel;
    
    totalMaterialCost = costFoundationsTotal + costBlocksAndBuildingMortarTotal + costPlasterMortarTotal + costPaintTotal + costStructureConcreteAndSteelTotal + costFinishingTotal;
    
    // Total estimated labor cost is now the sum of all specific labor categories
    estimatedLaborCost = totalDirectLaborCost;
    
    overallTotalCost = totalMaterialCost + estimatedLaborCost;


    // --- Display Results ---

    // 1. Foundations Results
    document.getElementById('resultFoundationsConcreteVolume').textContent = foundationsConcreteVolume.toFixed(2);
    document.getElementById('resultFoundationsSand').textContent = foundationsSand.toFixed(2);
    document.getElementById('resultFoundationsGravel').textContent = foundationsGravel.toFixed(2);
    document.getElementById('resultFoundationsCementBags').textContent = foundationsCementBags;
    document.getElementById('resultFoundationsSteel').textContent = foundationsSteel.toFixed(2);
    document.getElementById('costFoundationsSand').textContent = costFoundationsSand.toFixed(2);
    document.getElementById('costFoundationsGravel').textContent = costFoundationsGravel.toFixed(2);
    document.getElementById('costFoundationsCement').textContent = costFoundationsCement.toFixed(2);
    document.getElementById('costFoundationsSteel').textContent = costFoundationsSteel.toFixed(2);
    document.getElementById('costFoundationsTotal').textContent = costFoundationsTotal.toFixed(2);


    // 2. Walls (Block Building) Results
    document.getElementById('resultBlocks').textContent = totalBlocks;
    document.getElementById('resultBuildingSand').textContent = buildingSand.toFixed(2);
    document.getElementById('resultBuildingCementBags').textContent = buildingCementBags;
    document.getElementById('costBlocks').textContent = costBlocks.toFixed(2);
    document.getElementById('costBuildingSand').textContent = costBuildingSand.toFixed(2);
    document.getElementById('costBuildingCement').textContent = costBuildingCement.toFixed(2);
    document.getElementById('costBlocksAndBuildingMortarTotal').textContent = costBlocksAndBuildingMortarTotal.toFixed(2);

    // 3. Plastering (Lebkh) Results
    document.getElementById('resultPlasterSand').textContent = plasterSand.toFixed(2);
    document.getElementById('resultPlasterCementBags').textContent = plasterCementBags;
    document.getElementById('costPlasterSand').textContent = costPlasterSand.toFixed(2);
    document.getElementById('costPlasterCement').textContent = costPlasterCement.toFixed(2);
    document.getElementById('costPlasterMortarTotal').textContent = costPlasterMortarTotal.toFixed(2);

    // 4. Structure (Slabs, Columns, Beams) Results
    document.getElementById('resultTotalRoofArea').textContent = totalRoofArea.toFixed(2);
    document.getElementById('resultStructureConcreteVolume').textContent = structureConcreteVolume.toFixed(2);
    document.getElementById('resultStructureSand').textContent = structureSand.toFixed(2);
    document.getElementById('resultStructureGravel').textContent = structureGravel.toFixed(2);
    document.getElementById('resultStructureCementBags').textContent = structureCementBags;
    document.getElementById('resultStructureSteel').textContent = structureSteel.toFixed(2);
    document.getElementById('costStructureSand').textContent = costStructureSand.toFixed(2);
    document.getElementById('costStructureGravel').textContent = costStructureGravel.toFixed(2);
    document.getElementById('costStructureCement').textContent = costStructureCement.toFixed(2);
    document.getElementById('costStructureSteel').textContent = costStructureSteel.toFixed(2);
    document.getElementById('costStructureConcreteAndSteelTotal').textContent = costStructureConcreteAndSteelTotal.toFixed(2);

    // 5. Paint Results
    document.getElementById('resultPaint').textContent = totalPaintLiters.toFixed(2);
    document.getElementById('costPaintMaterial').textContent = costPaintMaterial.toFixed(2);
    document.getElementById('costPaintTotal').textContent = costPaintTotal.toFixed(2);

    // 6. Prices & Waste Results (Display current values, affected by exclusion of their section)
    // No direct display for individual prices in this section results, but they are used in calculations
    // Now displaying breakdown of labor costs
    document.getElementById('costLaborCarpentry').textContent = costLaborCarpentry.toFixed(2);
    document.getElementById('costLaborBlacksmith').textContent = costLaborBlacksmith.toFixed(2);
    document.getElementById('costLaborConcreteCasting').textContent = costLaborConcreteCasting.toFixed(2);
    document.getElementById('costLaborOther').textContent = costLaborOther.toFixed(2);
    document.getElementById('totalDirectLaborCost').textContent = totalDirectLaborCost.toFixed(2);


    // 7. Finishing Results
    document.getElementById('costFlooringTotal').textContent = costFlooringTotal.toFixed(2);
    document.getElementById('costDoorsTotal').textContent = costDoorsTotal.toFixed(2);
    document.getElementById('costWindowsTotal').textContent = costWindowsTotal.toFixed(2);
    document.getElementById('costElectricalTotal').textContent = costElectricalTotal.toFixed(2);
    document.getElementById('costPlumbingTotal').textContent = costPlumbingTotal.toFixed(2);
    document.getElementById('costCarpentryTotal').textContent = costCarpentryTotal.toFixed(2);
    document.getElementById('costBlacksmithTotal').textContent = costBlacksmithTotal.toFixed(2);
    document.getElementById('costFinishingTotal').textContent = costFinishingTotal.toFixed(2);


    // Overall Totals
    document.getElementById('resultOverallTotalSand').textContent = overallTotalSand.toFixed(2);
    document.getElementById('resultOverallTotalCementBags').textContent = overallTotalCementBags;
    document.getElementById('resultOverallTotalGravel').textContent = overallTotalGravel.toFixed(2);
    document.getElementById('resultOverallTotalSteel').textContent = overallTotalSteel.toFixed(2);
    document.getElementById('totalMaterialCost').textContent = totalMaterialCost.toFixed(2);
    document.getElementById('estimatedLaborCost').textContent = estimatedLaborCost.toFixed(2);
    document.getElementById('overallTotalCost').textContent = overallTotalCost.toFixed(2);
}

// Initial calculation and section state setup when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Set default values here based on your requirements
    document.getElementById('foundationAreaCoverage').value = 25; // 25% for foundations
    document.getElementById('wallLength').value = (200 * 0.8).toFixed(2); // Initial wall length based on 200m2 building area * 0.8
                                                                      // This will be recalculated by input listener if totalBuildingArea changes.

    // To handle "مساحة الأبواب والشبابيك هي 20-25 % من مساحة المبنى"
    // We will set the `openingArea` based on 20% of `totalBuildingArea` for the default value
    // If the user changes `totalBuildingArea`, the `openingArea` will remain fixed unless calculated dynamically.
    // For simplicity, let's update the *default* input value for `openingAreaPerFloor`
    // assuming it should be 20% of the *default* `totalBuildingArea` (200 sq.m).
    document.getElementById('openingArea').value = (200 * 0.20).toFixed(2); // 20% of default totalBuildingArea (200m2)
    // If you want this to be *dynamic* (always 20-25% of current totalBuildingArea), it needs more complex logic,
    // e.g., a function that updates `openingArea` whenever `totalBuildingArea` changes.
    // For now, it's just setting the default value on load.

    // Call calculateMaterials to apply the new default values and refresh the display
    for (const sectionId in excludedSections) {
        const section = document.getElementById(sectionId);
        if (section) {
            const button = section.querySelector('.toggle-button');
            const inputs = section.querySelectorAll('input');
            if (excludedSections[sectionId]) {
                section.classList.add('excluded');
                button.textContent = 'تضمين';
                button.classList.add('included');
                inputs.forEach(input => input.setAttribute('disabled', 'true'));
            } else {
                section.classList.remove('excluded');
                button.textContent = 'استبعاد';
                button.classList.remove('included');
                inputs.forEach(input => input.removeAttribute('disabled'));
            }
        }
    }
    calculateMaterials();
});

// Add event listeners to input fields for dynamic calculation
const inputs = document.querySelectorAll('input[type="number"]');
inputs.forEach(input => {
    input.addEventListener('input', calculateMaterials);
});
