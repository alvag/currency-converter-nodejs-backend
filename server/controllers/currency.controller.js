const axios = require('axios');
const fs = require('fs');
const { successResponse } = require('../helpers/response.helper');
const config = require('../config');
const path = require('path');
const Country = require('../models/country.model');
const Currency = require('../models/currency.model');
const Configuration = require('../models/config.model');

const getCountries = () => {
    return new Promise(resolve => {
        Configuration.findOne({ idConfig: 'countries' }, async (error, config) => {
            if (error || !config || dateDiff(config.updated) > 3) {
                let countries = await getCountriesFromExternalApi();
                resolve(countries);
            } else {
                let countries = await getCountriesFromDB();
                resolve(countries);
            }
        });
    });

};

const getCurrencies = (req, res) => {
    Configuration.findOne({ idConfig: 'currencies' }, async (error, config) => {
        if (error || !config) {
            let currencies = await getCurrenciesFromExternalApi();
            successResponse(res, { currencies });
        } else {
            if (dateDiff(config.updated) > 3) {
                let currencies = await getCurrenciesFromExternalApi();
                successResponse(res, { currencies });
            } else {
                let currencies = await getCurrenciesFromDB();
                successResponse(res, { currencies });
            }
        }
    });
};

/**
 * Retorna un array de paises de currencyconverterapi.com.
 * @returns Promise<Currency[]>
 */
const getCurrenciesFromExternalApi = () => {
    return new Promise(async resolve => {
        await getCountries();
        let url = `${config.CURRENCY_CONVERTER_API}/currencies`;
        try {
            let response = await axios.get(url);
            let arrCurrencies = await convertToArray(response.data.results);
            arrCurrencies = await setFlags(arrCurrencies);

            arrCurrencies.sort((a, b) => {
                if (a.id < b.id) return -1;
                if (a.id > b.id) return 1;
                return 0;
            });

            saveCurrencies(arrCurrencies);
            Configuration.findOneAndUpdate({ idConfig: 'currencies' }, { updated: new Date() }, { upsert: true }, () => { });
            resolve(arrCurrencies);
        } catch (error) {
            resolve([]);
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
            await saveCountries(arrCountries);
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
        Currency.find({}, async (error, arrCurrencies) => {
            if (error) {
                resolve([]);
            } else {
                if (arrCurrencies.length === 0) {
                    let arrCurrencies = await getCurrenciesFromExternalApi();
                    resolve(arrCurrencies);
                } else {
                    resolve(arrCurrencies);
                }
            }
        });
    });
};

/**
 * Retorna un array de paises de la base de datos.
 * @returns Promise<Country[]>
 */
const getCurrenciesFromDB = () => {
    return new Promise(async resolve => {
        Currency.find({}, async (error, arrCurrencies) => {
            if (error) {
                resolve([]);
            } else {
                if (arrCurrencies.length === 0) {
                    let arrCountries = await getCountriesFromExternalApi();
                    resolve(arrCountries);
                } else {
                    resolve(arrCurrencies);
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
 * Guarda las monedas en la base de datos.
 * @param currencies Currency[]
 */
const saveCurrencies = (currencies) => {
    currencies.forEach(c => {
        let currency = {
            id: c.id,
            currencyName: c.currencyName,
            currencySymbol: c.currencySymbol,
            flag: c.flag
        };
        Currency.findOneAndUpdate({ id: c.id }, currency, { upsert: true }, () => { });
    });
};

/**
 * Guarda los países en la base de datos.
 * @param countries Country[]
 */
const saveCountries = (countries) => {
    return new Promise(resolve => {
        countries.forEach((c, index) => {
            let country = {
                alpha3: c.alpha3,
                currencyId: c.currencyId,
                currencyName: c.currencyName,
                currencySymbol: c.currencySymbol,
                id: c.id,
                name: c.name
            };
            Country.findOneAndUpdate({ id: c.id }, country, { upsert: true }, () => {
                if (index === countries.length - 1) {
                    resolve();
                }
            });
        });
    });
};

const convertToArray = (obj) => {
    return new Promise(resolve => {
        let arr = Object.keys(obj).map((key) => {
            let newObj = obj[key];
            return newObj;
        });

        resolve(arr);
    });
};

const setFlags = (arrCurrencies) => {
    return new Promise(resolve => {
        arrCurrencies.forEach(async (currency, index) => {
            let countries = await getCountriesByCurrencyId(currency.id);
            if (countries.length > 0) {
                let file = path.resolve(__dirname, `../public/assets/img/flags/${countries[0].id}.png`);
                fs.stat(file, (error, stats) => {
                    if (stats && countries.length === 1) {
                        currency.flag = `${countries[0].id}.png`;
                    } else {
                        currency.flag = setCustomFlag(currency.id);
                    }
                    if (index === arrCurrencies.length - 1) {
                        resolve(arrCurrencies);
                    }
                });
            } else {
                currency.flag = setCustomFlag(currency.id);
                if (index === arrCurrencies.length - 1) {
                    resolve(arrCurrencies);
                }
            }
        });
    });
};

const sort = (arr) => {

}

const setCustomFlag = (currencyId) => {
    switch (currencyId) {
        case 'EUR':
            return 'EU.png';
        case 'XAF':
            return 'CF.png';
        case 'FKP':
            return 'FK.png';
        case 'USD':
            return 'US.png';
        case 'AUD':
            return 'AU.png';
        case 'CVE':
            return 'CV.png';
        case 'ANG':
            return 'AN.png';
        case 'SDG':
            return 'SD.png';
        case 'BYR':
            return 'BY.png';
        case 'BYN':
            return 'BY.png';
        case 'CHF':
            return 'CH.png';
        case 'BTC':
            return 'BTC.png';
        default:
            return '_unknown.png';
    }
};

const getCountriesByCurrencyId = (currencyId) => {
    return new Promise(resolve => {
        Country.find({ currencyId: currencyId }, 'id')
            .exec((error, countries) => {
                if (error || countries.length === 0) {
                    resolve([]);
                } else {
                    resolve(countries);
                }
            });
    });
};

module.exports = {
    /* getCountries, */
    getCurrencies
};
