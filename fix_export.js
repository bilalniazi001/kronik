const fs = require('fs');
const path = require('path');

const inputFile = path.join('E:', 'Programs', 'OnestaSQL.sql');
const outputFile = path.join('E:', 'Programs', 'OnestaSQL_Fixed.sql');

try {
    console.log('Reading file...');
    let sql = fs.readFileSync(inputFile, 'utf8');

    console.log('Removing DEFINERs...');
    // Safely remove definers like DEFINER=`root`@`localhost`
    sql = sql.replace(/DEFINER=`[^`]+`@`[^`]+`/g, '');
    
    // Also remove any USE statements that might cause issues
    sql = sql.replace(/USE `[^`]+`;/g, '');

    console.log('Writing fixed file...');
    fs.writeFileSync(outputFile, sql);
    console.log('Done! The fixed file is ready at:', outputFile);

} catch (error) {
    console.error('An error occurred:', error.message);
}
