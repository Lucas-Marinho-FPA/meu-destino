/* Carrega o código-fonte do app (camada de regras + componente) como texto,
   na mesma ordem em que o index.html carrega. Usado pelos testes unitários (Node, sem navegador). */
const fs = require('fs');
const path = require('path');
module.exports = function source() {
  const root = path.resolve(__dirname, '..', '..');
  return fs.readFileSync(path.join(root, 'src', 'logic.js'), 'utf8') + '\n' + fs.readFileSync(path.join(root, 'src', 'component.js'), 'utf8');
};
