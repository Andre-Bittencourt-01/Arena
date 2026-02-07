import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Use absolute path for reliability relative to backend root
const outputDir = path.join(process.cwd(), 'exports');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

const escapeCsvValue = (value: any): string => {
    if (value === null || value === undefined) {
        return '';
    }
    // Convert timestamps/objects to string
    let stringValue: string;
    if (value instanceof Date) {
        stringValue = value.toISOString();
    } else if (typeof value === 'object') {
        stringValue = JSON.stringify(value);
    } else {
        stringValue = String(value);
    }

    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
};

const exportModel = async (modelName: string, data: any[]) => {
    if (data.length === 0) {
        console.log(`No data for ${modelName}`);
        // Create empty file with headers if possible, or just skip
        return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => escapeCsvValue(row[header])).join(','))
    ].join('\n');

    const filePath = path.join(outputDir, `${modelName}.csv`);
    fs.writeFileSync(filePath, csvContent);
    console.log(`Exported ${data.length} records to ${filePath}`);
};

async function main() {
    console.log(`Starting export to ${outputDir}...`);

    // List of models to export (camelCase matching prisma client)
    const models = [
        'user',
        'systemSettings',
        'managedChannel',
        'userMembership',
        'event',
        'fighter',
        'fight',
        'pick',
        'league',
        'leagueMember'
    ];

    for (const model of models) {
        try {
            console.log(`Exporting ${model}...`);
            // @ts-ignore
            const data = await prisma[model].findMany();
            await exportModel(model, data);
        } catch (e) {
            console.error(`Error exporting ${model}:`, e);
        }
    }

    console.log('Export complete.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
