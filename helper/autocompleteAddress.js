import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const filePath = path.join(__dirname, '..', 'data', 'dvhcvn.json');

export function autocompeleteAddress(keyword, res) {
    const results = [];
    const data = JSON.parse(fs.readFileSync(filePath));
    if (keyword == '') {
        return res.status(400).send(results);
    }
    data.forEach((level1) => {
        const level1Name = level1.name.toLowerCase();
        if (level1Name.includes(keyword.toLowerCase())) {
            level1.level2s.forEach(level2 => {
                level2.level3s.forEach(level3 => {
                    const locationString = `${level3.name},${level2.name},${level1.name}`;
                    results.push(locationString);
                })
            })
        } else {
            level1.level2s.forEach(level2 => {
                const level2Name = level2.name.toLowerCase();
                if (level2Name.includes(keyword.toLowerCase())) {
                    level2.level3s.forEach(level3 => {
                        const locationString = `${level3.name},${level2.name},${level1.name}`;
                        results.push(locationString);
                    })
                } else {
                    level2.level3s.forEach(level3 => {
                        const level3Name = level3.name.toLowerCase();
                        if (level3Name.includes(keyword.toLowerCase())) {
                            const locationString = `${level3.name},${level2.name},${level1.name}`;
                            results.push(locationString);
                        }
                    })
                }
            })
        }
    });
    res.json(results);
}