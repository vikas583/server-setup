import { promises as fs } from 'fs';
import path from 'path';

export async function loadTemplate(templateName: string, replacements: Record<string, string>): Promise<string> {
    const templatePath = path.join(`${__dirname}/../emailTemplates/`, `${templateName}.html`);
    let template = await fs.readFile(templatePath, 'utf-8');

    // Replace placeholders in the template
    for (const key in replacements) {
        const placeholder = `{{${key}}}`;
        template = template.replace(new RegExp(placeholder, 'g'), replacements[key]);
    }

    return template;
}