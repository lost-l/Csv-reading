"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const csv_parse_1 = require("csv-parse");
const mortal = (dwellers, deceased) => (((deceased * 100) / dwellers) * 100).toFixed(2);
const statisticsCovid = (err, data) => {
    if (err) {
        console.log(`Se ha presentado un error en la lectura de los datos: ${err}`);
        return;
    }
    data.sort((a, b) => {
        if (a.Province_State < b.Province_State)
            return -1;
        if (a.Province_State > b.Province_State)
            return 1;
        return 0;
    });
    let curr_date = Object.keys(data.at(0)).at(-1), curr_state = data.at(0).Province_State, acum_state = 0, dwellers = 0, dwellers_min = 0, dwellers_max = 0, state_max = 0, state_min = Number.MAX_SAFE_INTEGER, state_nm_max = "", state_nm_min = "";
    for (let i = 0; i < data.length; i++) {
        let city = data.at(i);
        if (city.Province_State !== curr_state) {
            if (acum_state > state_max) {
                state_max = acum_state;
                state_nm_max = curr_state;
                dwellers_max = dwellers;
            }
            if (acum_state < state_min) {
                state_min = acum_state;
                state_nm_min = curr_state;
                dwellers_min = dwellers;
            }
            curr_state = city.Province_State;
            dwellers = acum_state = 0;
        }
        acum_state += city[curr_date];
        dwellers += city.Population;
    }
    console.log("1. Estado con mayor acumulado a la fecha");
    console.log(`\tEl estado de ${state_nm_max} con una población de ${dwellers_max}, cuenta con un acumulado de ${state_max} fallecidos para la fecha de ${curr_date}`);
    console.log(`\tPorcentaje de muertes: ${mortal(dwellers_max, state_max)} %`);
    console.log("2. Estado con menor acumulado a la fecha");
    console.log(`\tEl estado de ${state_nm_min} con una población de ${dwellers_min}, cuenta con un acumulado de ${state_min} de fallecidos para la fecha de ${curr_date}`);
    console.log(`\tPorcentaje de muertes: ${mortal(dwellers_min, state_min)} %`);
    console.log(`En conclusión, el estado mas afectado hasta la fecha fue ${state_nm_max} puesto que al contrastar el numero de fallecidos con los demas estados esté los supera.`);
};
const parser = (0, csv_parse_1.parse)({
    columns: true,
    cast: true,
}, statisticsCovid);
fs.createReadStream(path.resolve("helpers/data_covid.csv"), {
    encoding: "utf-8"
})
    .pipe(parser);
