#!/bin/bash
echo Starting Docusaurus...
\. "/home/i3x/.nvm/nvm.sh"
cd /home/i3x/i3x-docs/
npm run start -- --host 0.0.0.0
