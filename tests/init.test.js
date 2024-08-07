import supertest from 'supertest';
import chai from 'chai';
import api from '../server';

global.app = api;
global.request = supertest(api);
global.expect = chai.expect;
global.assert = chai.assert;
global.should = chai.should();
global.chai = chai;
global.supertest = supertest;
global.chaiHttp = require('chai-http');
chai.use(chaiHttp);
