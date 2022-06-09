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
    
    it('Verify basic response data', () => {
        return request.get('/data/2.5/onecall').query({
            lat: -33.865143,
            lon: 151.209900,
            exclude:'minutely,hourly',
            appid:'84926d151438f232af45e9d24203fff1',
            units:'metric'
           }).then((response) => {
            expect(response.statusCode).to.be.eql(200);
            expect(response.body.timezone).to.be.eql('Australia/Sydney');
            expect(response.body.lat).to.be.eql(-33.8651);
            expect(response.body.lon).to.be.eql(151.2099);
        });
    });

    it('Verify 7 day forcast range', () => {
        return request.get('/data/2.5/onecall').query({
            lat: -33.865143,
            lon: 151.209900,
            exclude:'minutely,hourly',
            appid:'84926d151438f232af45e9d24203fff1',
            units:'metric'
           }).then((response) => {
            expect(response.statusCode).to.be.eql(200);
            expect(response.body.daily.length).to.be.eql(8);
        });
    });

    it('Verify number of mornings >= 9', () => {
        return request.get('/data/2.5/onecall').query({
            lat: -33.865143,
            lon: 151.209900,
            exclude:'minutely,hourly',
            appid:'84926d151438f232af45e9d24203fff1',
            units:'metric'
           }).then((response) => {
            expect(response.statusCode).to.be.eql(200);
            var list = []
            for(i=1;i<response.body.daily.length;i++){             //Set i as 1 as current day needs to be ommitted
                if(response.body.daily[i].temp.morn>=9){
                    list.push(response.body.daily[i].temp.morn);
                }
            }
            expect(list.length).to.be.greaterThanOrEqual(1);
        });
    });

    it('Verify if 3 hours are left before sunset', () => {
        return request.get('/data/2.5/onecall').query({
            lat: -33.865143,
            lon: 151.209900,
            exclude:'minutely,hourly',
            appid:'84926d151438f232af45e9d24203fff1',
            units:'metric'
           }).then((response) => {
            expect(response.statusCode).to.be.eql(200);
            var date1 = new Date(response.body.current.sunset * 1000);
            var date2 = new Date(response.body.current.dt * 1000);    
            var hours = Math.abs(date1 - date2) / 36e5;
            console.log("\tTime difference is '" + Math.round(hours) + "' hours")
            expect(hours).to.be.greaterThanOrEqual(3);
        });
    });

    it('Verify if real feel temperature is 5% colder than actual temperature', () => {
        return request.get('/data/2.5/onecall').query({
            lat: -33.865143,
            lon: 151.209900,
            exclude:'minutely,hourly',
            appid:'84926d151438f232af45e9d24203fff1',
            units:'metric'
           }).then((response) => {
            expect(response.statusCode).to.be.eql(200);
            // Value of Feels Like temperature minus Actual temperature divided by 100
            feelTempCheck = ((response.body.current.temp - response.body.current.feels_like) / response.body.current.temp)*100
            expect(feelTempCheck).to.be.greaterThanOrEqual(5);
        });
    });

    it('Verify if a rainy day will occur', () => {
        return request.get('/data/2.5/onecall').query({
            lat: -33.865143,
            lon: 151.209900,
            exclude:'minutely,hourly',
            appid:'84926d151438f232af45e9d24203fff1',
            units:'metric'
           }).then((response) => {
            expect(response.statusCode).to.be.eql(200);
            var rainyDays = [];
            for(i=0;i<response.body.daily.length;i++){
                if(response.body.daily[i].weather[0].main == "Rain"){
                    rainyDays.push(response.body.daily[i].dt)
                }
            }
            expect(rainyDays.length).to.be.greaterThanOrEqual(1);
            // Display the days that it will rain   
            if (rainyDays != null){
                for(i=0;i<rainyDays.length;i++){
                    var date = new Date(rainyDays[i]*1000);
                    console.log("\tIt will be raining on " + date.getDate()+ "/"+(date.getMonth()+1)+"/"+date.getFullYear())
                }
            }            
        });
    });
})