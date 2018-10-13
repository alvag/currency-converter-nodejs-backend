const axios = require('axios');
const fs = require('fs');
const { successResponse } = require('../helpers/response.helper');
const config = require('../config');
const path = require('path');
const Country = require('../models/country.model');
const Configuration = require('../models/config.model');

const getCountries = (req, res) => {
    Configuration.findOne({ idConfig: 'countries' }, async (error, config) => {
        if (error || !config) {
            let arrCountries = await getCountriesFromExternalApi();
            successResponse(res, { arrCountries });
        } else {
            if (dateDiff(config.updated) > 1) {
                let arrCountries = await getCountriesFromExternalApi();
                successResponse(res, { arrCountries });
            } else {
                let arrCountries = await getCountriesFromDB();
                successResponse(res, { arrCountries });
            }
        }
    });
};

/**
 * Retorna un array de paises de currencyconverterapi.com.
 * @returns Promise<Country[]>
 */
const getCountriesFromExternalApi = () => {
    return new Promise(async resolve => {
        let url = `${config.CURRENCY_CONVERTER_API}/countries`;
        try {
            let response = await axios.get(url);
            let arrCountries = await convertToArray(response.data.results);
            saveCountries(arrCountries);
            Configuration.findOneAndUpdate({ idConfig: 'countries' }, { updated: new Date() }, { upsert: true }, () => { });
            resolve(arrCountries);
        } catch (error) {
            resolve([]);
        }
    });
};

/**
 * Retorna un array de paises de la base de datos.
 * @returns Promise<Country[]>
 */
const getCountriesFromDB = () => {
    return new Promise(async resolve => {
        Country.find({}, async (error, arrCountries) => {
            if (error) {
                resolve([]);
            } else {
                if (arrCountries.length === 0) {
                    let arrCountries = await getCountriesFromExternalApi();
                    resolve(arrCountries);
                } else {
                    resolve(arrCountries);
                }
            }
        });
    });
};

/**
 * Retorna la diferencia entre dos fechas en días.
 * @param {Date} oldDate
 */
const dateDiff = (oldDate) => {
    let old = new Date(oldDate);
    let timeDiff = Math.abs(new Date().getTime() - old.getTime());
    return timeDiff / (1000 * 3600 * 24);
};

/**
 * Guarda los países en la base de datos.
 * @param countries Country[]
 */
const saveCountries = (countries) => {
    countries.forEach(c => {
        let country = new Country({
            alpha3: c.alpha3,
            currencyId: c.currencyId,
            currencyName: c.currencyName,
            currencySymbol: c.currencySymbol,
            countryId: c.id,
            name: c.name,
            flag: c.flag
        });
        Country.findOneAndUpdate({ countryId: c.id }, country, { upsert: true }, () => { });
    });
};

const convertToArray = (countries) => {
    return new Promise(resolve => {
        let arrCountries = Object.keys(countries).map((key) => {
            let country = countries[key];
            return country;
        });

        arrCountries.forEach((country, index) => {
            let file = path.resolve(__dirname, `../public/assets/img/flags/${country.id}.png`);
            fs.stat(file, (err, stats) => {
                if (stats) {
                    country.flag = `${country.id}.png`;
                }

                if (index === arrCountries.length - 1) {

                    arrCountries.sort((a, b) => {
                        if (a.currencyId < b.currencyId) return -1;
                        if (a.currencyId > b.currencyId) return 1;
                        return 0;
                    });
                    resolve(arrCountries);
                }
            });
        });
    });
};

module.exports = {
    getCountries
};
