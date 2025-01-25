const pwEl = document.getElementById("pw");
const lenEl = document.getElementById("len");
const upperEl = document.getElementById("upper");
const lowerEl = document.getElementById("lower");
const numberEl = document.getElementById("number");
const symbolEl = document.getElementById("symbol");
const generateEl = document.getElementById("generate");

const upperLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const lowerLetters = "abcdefghijklmnopqrstuvwxyz";
const numbers = "0123456789";
const symbols = "!@#$%^&*()_+";

function getUppercase(){
  return upperLetters[Math.floor(Math.random()*upperLetters.length)];
}

function getLowercase(){
  return lowerLetters[Math.floor(Math.random()*lowerLetters.length)];
}

function getNumber(){
  return numbers[Math.floor(Math.random()*numbers.length)];
}

function getSymbols(){
  return symbols[Math.floor(Math.random()*symbols.length)];
}

function generatePassword(){
  
}