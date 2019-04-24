import chai from 'chai';
import faker from 'faker';
import debug from 'debug';
import chaiHttp from 'chai-http';
import db from '../models';
import fakeData from './mockData/articleMockData';
import index from '../index';

const articleModel = db.article;
const userModel = db.user;

chai.should();
chai.use(chaiHttp);

const logError = debug('app:*');
/**
 * @author: Innocent Nkunzi
 * @description: tests related to article
 */

before('Cleaning the database first', async () => {
  await articleModel.destroy({ truncate: true, cascade: true });
  await userModel.destroy({ where: { email: userModel.email }, truncate: true, cascade: true });
});
const user = {
  username: 'nkunziinnocent',
  email: 'nkunzi@gmail.com',
  password: '@Nkunzi1234',
};
let userToken;
describe('Create a user to be used in in creating article', () => {
  it('should create a user', (done) => {
    chai.request(index).post('/api/auth/signup').set('x-access-token', `${userToken}`).send(user)
      .then((res) => {
        res.should.have.status(200);
        res.body.user.should.be.a('object');
        res.body.user.should.have.property('username');
        userToken = res.body.user.token;
        done();
      })
      .catch(error => logError(error));
  }).timeout(15000);
});
describe('Create an article', () => {
  it('should create an article', (done) => {
    chai.request(index).post('/api/articles').set('x-access-token', `${userToken}`).send(fakeData)
      .then((res) => {
        res.should.have.status(201);
        res.body.should.have.property('article');
        res.body.article.should.be.a('object');
        res.body.article.should.have.property('id');
        res.body.article.should.have.property('slug');
        res.body.article.should.have.property('title');
        res.body.article.should.have.property('description');
        res.body.article.should.have.property('createdAt');
        res.body.article.should.have.property('updatedAt');
        done();
      })
      .catch(error => logError(error));
  }).timeout(15000);
});
describe('It checks title errors', () => {
  it('Should not create an article if the title is empty', (done) => {
    const newArticle = {
      title: '',
      description: faker.lorem.paragraph(),
      body: faker.lorem.paragraphs(),
    };
    chai.request(index).post('/api/articles').set('x-access-token', `${userToken}`).send(newArticle)
      .then((res) => {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('error').eql('title can not be null');
        done();
      })
      .catch(error => logError(error));
  });
});
describe('Test the body', () => {
  it('should not create and article if the body is empty', (done) => {
    const newArticle = {
      title: faker.random.words(),
      description: faker.lorem.paragraph(),
      body: '',
    };
    chai.request(index).post('/api/articles').set('x-access-token', `${userToken}`).send(newArticle)
      .then((res) => {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('error').eql('body can not be null');
        done();
      })
      .catch(error => logError(error));
  });
  it('should return an error if the body is not predefined', (done) => {
    const longTitleArticle = {
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
    };
    chai.request(index).post('/api/articles').set('x-access-token', `${userToken}`).send(longTitleArticle)
      .then((res) => {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('error').eql('body can not be null');
        done();
      })
      .catch(error => logError(error));
  });
});
describe('Test the title', () => {
  it('should substring a long title to only 40 characters', (done) => {
    const longTitleArticle = {
      title: faker.lorem.sentences(),
      body: faker.lorem.paragraphs(),
      description: faker.lorem.paragraph(),
    };
    chai.request(index).post('/api/articles').set('x-access-token', `${userToken}`).send(longTitleArticle)
      .then((res) => {
        res.should.have.status(201);
        res.body.should.be.a('object');
        res.body.should.have.property('article');
        done();
      })
      .catch(error => logError(error));
  });
});
describe('Test description', () => {
  const newArticle = {
    title: faker.lorem.sentence(),
    body: faker.lorem.paragraphs(),
  };
  it('should provide a description if not provided', (done) => {
    chai.request(index).post('/api/articles').set('x-access-token', `${userToken}`).send(newArticle)
      .then((res) => {
        res.should.have.status(201);
        res.body.should.have.property('article');
        res.body.article.should.have.property('description');
        done();
      })
      .catch(error => logError(error));
  });
});
let newSlug;
describe('Tests for get article', () => {
  const newArticle = {
    title: 'hello world',
    description: faker.lorem.paragraph(),
    body: faker.lorem.paragraphs(),
  };
  it('should create an article to be used in get', (done) => {
    chai.request(index).post('/api/articles/').set('x-access-token', `${userToken}`).send(newArticle)
      .then((res) => {
        res.should.have.status(201);
        res.body.should.have.property('article');
        newSlug = res.body.article.slug;
        done();
      })
      .catch(error => logError(error));
  });
  it('should return an article created', (done) => {
    chai.request(index).get(`/api/articles/${newSlug}`).then((res) => {
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('article');
      res.body.article.should.have.property('slug').eql(newSlug);
      done();
    }).catch(error => logError(error));
  });
});
describe('Get article errors', () => {
  const invalid = 'jkfaljfalj';
  it('should not return an article if the article slug is not in the database', (done) => {
    chai.request(index).get(`/api/articles/${invalid}`).then((res) => {
      res.should.have.status(404);
      res.body.should.be.a('object');
      res.body.should.have.property('error').eql('No article found with the slug provided');
      done();
    }).catch(error => logError(error));
  });
});


describe('reset password with an existing email', () => {
  it('it should return error', (done) => {
    chai.request(index).post('/api/auth/forgetpassword').send({ email: user.email })
      .then((result) => {
        result.should.have.status(202);
        done();
      })
      .catch(error => logError(error));
  });
});
describe('Bookmark tests', () => {
  it('should bookmark an article', (done) => {
    chai.request(index).post(`/api/articles/${newSlug}/bookmark`).set('x-access-token', `${userToken}`).then((res) => {
      // console.log(res);
      res.should.have.status(201);
      res.body.should.be.a('object');
      done();
    })
      .catch(error => logError(error));
  });
  it('should not bookmark an article for the second time', (done) => {
    chai.request(index).post(`/api/articles/${newSlug}/bookmark`).set('x-access-token', `${userToken}`).then((res) => {
      // console.log(res);
      res.should.have.status(403);
      res.body.should.be.a('object');
      done();
    })
      .catch(error => logError(error));
  });
});
