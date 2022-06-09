const request = require('supertest')("https://api.openweathermap.org");
var currentAndForecastSchema = require('./currentAndForecastSchema.json');
const {expect} = require("chai").use(require('chai-json-schema'));

describe('Current and Forcast weather data API response validation', () => {
    it('Verify Schema', () => {
        return request.get('/data/2.5/onecall').query({
            lat: -33.865143,
            lon: 151.209900,
            exclude:'minutely,hourly',
            appid:'84926d151438f232af45e9d24203fff1',
            units:'metric'
           }).then((response) => {
            expect(response.statusCode).to.be.eql(200);
            expect(response.body.daily).to.be.jsonSchema(currentAndForecastSchema)

        });
    });
})