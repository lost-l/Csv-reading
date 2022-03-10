import * as fs from "fs";
import * as path from "path"
import { parse, CsvError } from "csv-parse";


const mortal = (dwellers: number, deceased: number): string => (
    ((deceased * 100) / dwellers) 
).toFixed(2);

const statisticsCovid = (err: CsvError | undefined, data: any): void => {
    if (err) {
        console.log(`Se ha presentado un error en la lectura de los datos: ${err}`);
        return;
    }
    data.sort((a: any, b: any) => {
        if (a.Province_State < b.Province_State) return -1;
        if (a.Province_State > b.Province_State) return 1;
        return 0;
    });

    let curr_date = Object.keys(data.at(0)).at(-1)!,
        curr_state = data.at(0).Province_State,
        acum_state = 0,
        dwellers = 0,
        dwellers_min = 0,
        dwellers_max = 0,
        state_max = 0,
        state_min = Number.MAX_SAFE_INTEGER,
        state_nm_max = "",
        state_nm_min = "";

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
    console.log(`\tPorcentaje de muertes: ${mortal(dwellers_max, state_max)} %`)

    console.log("2. Estado con menor acumulado a la fecha");
    console.log(`\tEl estado de ${state_nm_min} con una población de ${dwellers_min}, cuenta con un acumulado de ${state_min} de fallecidos para la fecha de ${curr_date}`);
    console.log(`\tPorcentaje de muertes: ${mortal(dwellers_min, state_min)} %`)

    console.log(`En conclusión, el estado mas afectado hasta la fecha (${curr_date}) fue ${state_nm_max} puesto que al contrastar el numero de fallecidos con los demas estados, esté los supera.`)
}

const parser = parse({
    columns: true,
    cast: true,
}, statisticsCovid)

fs.createReadStream(path.resolve("helpers/data_covid.csv"), {
    encoding: "utf-8"
})
    .pipe(parser)
