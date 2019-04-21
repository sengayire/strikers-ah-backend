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
// A user to be used to create article
const user = {
  username: 'nkunziinnocent',
  email: 'nkunzi@gmail.com',
  password: '@Nkunzi1234',
};
// A user to be used to update an article that they didn't create
const newUser = {
  username: 'isharaketis',
  email: 'ishara@gmail.com',
  password: 'Ishara@123',
};
let userToken, testToken;
describe('Create a user to be used in in creating article', () => {
  it('should create a user', (done) => {
    chai.request(index).post('/api/auth/signup').send(user).then((res) => {
      res.should.have.status(200);
      res.body.user.should.be.a('object');
      res.body.user.should.have.property('username');
      userToken = res.body.user.token;
      done();
    })
      .catch(err => err);
  }).timeout(15000);

  it('should create another user to test article ownsershp', () => {
    chai.request(index).post('/api/auth/signup').send(newUser).then((res) => {
      res.should.have.status(200);
      res.body.user.should.be.a('object');
      res.body.user.should.have.property('username');
      testToken = res.body.user.token;
    });
  });
});
describe('Create an article', () => {
  it('should create an article', (done) => {
    chai.request(index).post('/api/articles').send(fakeData).set('x-access-token', `${userToken}`)
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
    chai.request(index).post('/api/articles').send(newArticle).set('x-access-token', `${userToken}`)
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
      body: ''
    };
    chai.request(index).post('/api/articles').send(newArticle).set('x-access-token', `${userToken}`)
      .then((res) => {
        res.should.have.status(400);
        res.body.should.be.a('object');
        //   res.body.should.have.property('error').eql('The body can\'t be empty');
        done();
      })
      .catch(error => logError(error));
  });
  it('should return an error if the body is not predefined', (done) => {
    const longTitleArticle = {
      title: faker.lorem.sentences(),
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
    chai.request(index).post('/api/articles').send(longTitleArticle).set('x-access-token', `${userToken}`)
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
    chai.request(index).post('/api/articles').send(newArticle).set('x-access-token', `${userToken}`)
      .then((res) => {
        res.should.have.status(201);
        res.body.should.have.property('article');
        res.body.article.should.have.property('description');
        done();
      })
      .catch(error => logError(error));
  });
});
describe('Update tests', () => {
  let newSlug;
  const newArticle = {
    title: faker.lorem.sentence(),
    body: faker.lorem.paragraphs(),
  };
  it('should create an article to be updated', (done) => {
    chai.request(index).post('/api/articles/').send(newArticle).set('x-access-token', `${userToken}`)
      .then((res) => {
        res.should.have.status(201);
        res.body.should.have.property('article');
        newSlug = res.body.article.slug;
        done();
      })
      .catch(error => logError(error));
  });

  it('should not update an article if a user is not the owner of the article', (done) => {
    chai.request(index).put(`/api/articles/${newSlug}`).send(newArticle).set('x-access-token', `${testToken}`)
      .then((res) => {
        res.should.have.status(404);
        res.body.should.be.a('object');
        res.body.should.have.property('error').eql('No article found for you to edit');
        done();
      })
      .catch(error => logError(error));
  });
  it('should update an article', (done) => {
    chai.request(index).put(`/api/articles/${newSlug}`).send(newArticle).set('x-access-token', `${userToken}`)
      .then((res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('message').eql('Article updated');
        done();
      })
      .catch(error => logError(error));
  });
});
