/**
 * @description
 * Este arquivo exporta um objeto 'dom' que serve como um contêiner central
 * para todas as referências de elementos do DOM (Document Object Model).
 * * A ideia é que outros módulos, como o ui_controller.js, possam popular
 * este objeto com os elementos da tela (ex: botões, painéis, etc.)
 * para que eles possam ser facilmente acessados por toda a aplicação sem
 * a necessidade de chamar document.getElementById repetidamente.
 */

export const dom = {};

