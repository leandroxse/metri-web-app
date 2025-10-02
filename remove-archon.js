const fs = require('fs');
const path = 'C:\\Users\\Leandro\\.claude.json';

console.log('Lendo arquivo...');
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

let count = 0;
if (data.conversations) {
  for (let conv of data.conversations) {
    if (conv.mcpServers && conv.mcpServers.archon) {
      delete conv.mcpServers.archon;
      count++;
    }
  }
}

console.log(`Removidas ${count} referências ao archon`);
fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('Arquivo atualizado com sucesso!');
