const fs = require('fs');

let html = fs.readFileSync('landing_page_stitch_full.html', 'utf8');
const start = html.indexOf('<header');
const end = html.lastIndexOf('<script'); // stop before the script at the end of body

if (start !== -1 && end !== -1 && start < end) {
    let text = html.slice(start, end);
    text = text.replace(/class=/g, 'className=')
        .replace(/style="[^"]*"/g, '')
        .replace(/href="#"/g, 'href=""')
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/for=/g, 'htmlFor=')
        .replace(/<br >/g, '<br />');

    // fix img
    let parts = text.split('<img');
    for (let i = 1; i < parts.length; i++) {
        let closingIdx = parts[i].indexOf('>');
        if (closingIdx !== -1 && parts[i][closingIdx - 1] !== '/') {
            parts[i] = parts[i].substring(0, closingIdx) + ' />' + parts[i].substring(closingIdx + 1);
        }
    }
    text = parts.join('<img');

    // fix input
    parts = text.split('<input');
    for (let i = 1; i < parts.length; i++) {
        let closingIdx = parts[i].indexOf('>');
        if (closingIdx !== -1 && parts[i][closingIdx - 1] !== '/') {
            parts[i] = parts[i].substring(0, closingIdx) + ' />' + parts[i].substring(closingIdx + 1);
        }
    }
    text = parts.join('<input');

    // fix br
    parts = text.split('<br>');
    text = parts.join('<br />');

    const page = `"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function LandingPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleAccordion = (id: string) => {
        // Implementação do acordeon aqui, se necessário ou migração para state do react
    };

    return (
        <div className="bg-brand-bg text-brand-text font-sans antialiased selection:bg-brand-primary/30 selection:text-white">
            ${text}
        </div>
    );
}`;

    fs.writeFileSync('app/page.tsx', page, 'utf8');
    console.log('Successfully updated app/page.tsx!');
} else {
    console.log('Failed to find start or end tags. start:', start, 'end:', end);
}
