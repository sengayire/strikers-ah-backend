import chai from 'chai';
import chaiHttp from 'chai-http';
import faker from 'faker';
import db from '../models';
import index from '../index';


const articleModel = db.article;
const userModel = db.user;
const ratingModel = db.rating;

const enumRate = {
  Terrible: 1,
  Bad: 2,
  Okay: 3,
  Good: 4,
  Great: 5
};
Object.freeze(enumRate);

chai.should();
chai.use(chaiHttp);

/**
 * @author: Clet Mwunguzi
 * @description: tests related to article
 */
before('Cleaning the database first', async () => {
  await articleModel.destroy({ truncate: true, cascade: true });
  await userModel.destroy({ where: { email: userModel.email }, truncate: true, cascade: true });
  await ratingModel.destroy({ truncate: true, cascade: true });
});

const user = {
  id: 3,
  username: 'mwunguzi',
  email: 'clet@hjih.com',
  password: '@Cletw1234',
};

let newArticle;
describe('Create a user for rating an article', () => {
  it('should create a user', (done) => {
    chai.request(index).post('/api/auth/signup').send(user).then((res) => {
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.user.should.be.a('object');
      res.body.user.should.have.property('username').equal('mwunguzi');
      res.body.user.should.have.property('email').equal('clet@hjih.com');
      res.body.user.should.have.property('bio');
      res.body.user.should.have.property('image');
      res.body.user.should.have.property('token');
      done();
    })
      .catch(err => err);
  }).timeout(15000);
});

const fakeData = {
  title: faker.random.words(),
  description: faker.lorem.paragraphs(),
  body: faker.lorem.paragraphs(),
  authorid: 3
};
describe('Create an article', () => {
  it('should create an article 2', (done) => {
    chai.request(index).post('/api/articles').send(fakeData).then((res) => {
      newArticle = res.body.article.id;
      res.should.have.status(201);
      res.body.should.have.property('article');
      res.body.should.be.a('object');
      res.body.article.should.be.a('object');
      res.body.article.should.have.property('id');
      res.body.article.should.have.property('slug');
      res.body.article.should.have.property('title').equal(fakeData.title);
      res.body.article.should.have.property('description');
      res.body.article.should.have.property('body').equal(fakeData.body);
      res.body.article.should.have.property('authorid').equal(3);
      res.body.article.should.have.property('taglist');
      res.body.article.should.have.property('createdAt');
      res.body.article.should.have.property('updatedAt');
      done();
    })
      .catch(err => err);
  });
});

describe('Rate an article', () => {
  it('should not enter an invalid rating', (done) => {
    chai.request(index).post('/api/articles/er/Terrible').then((res) => {
      res.should.have.status(400);
      res.body.should.be.a('object');
      res.body.should.have.property('status').equal(400);
      res.body.should.have.property('error').equal('Id of the article is not a number');
      done();
    })
      .catch(err => err);
  });

  it('Should not enter an invalid article id', (done) => {
    chai.request(index)
      .post('/api/articles/4/Terribl')
      .then((res) => {
        res.should.have.status(400);
        res.body.should.be.a('object');
        res.body.should.have.property('status').equal(400);
        res.body.should.have.property('error').equal('invalid rating');
        done();
      })
      .catch(err => err);
  });

  it('Should verify if article exists', (done) => {
    chai.request(index)
      .post('/api/articles/2043/Terrible')
      .then((res) => {
        res.body.should.be.a('object');
        res.body.should.have.property('status').equal(400);
        res.body.should.have.property('error').equal('Article can not be found.');
        done();
      })
      .catch(err => err);
  });


  it('Create a new rate for an article', (done) => {
    chai.request(index)
      .post(`/api/articles/${newArticle}/Terrible`)
      .then((res) => {
        res.body.should.be.a('object');
        res.body.should.have.property('status').equal(201);
        res.body.message.should.be.a('object');
        res.body.should.have.property('message');
        res.body.message.should.have.property('id');
        res.body.message.should.have.property('rating').equal(enumRate.Terrible);
        res.body.message.should.have.property('articleId').equal(newArticle);
        res.body.message.should.have.property('userId'); //    test exact user from token
        res.body.message.should.have.property('updatedAt');
        res.body.message.should.have.property('createdAt');
        done();
      })
      .catch(err => err);
  });

  it('update a rate of an article', (done) => {
    chai.request(index)
      .post(`/api/articles/${newArticle}/Good`)
      .then((res) => {
        res.body.should.be.a('object');
        res.body.should.have.property('status').equal(201);
        res.body.message.should.be.a('object');
        res.body.should.have.property('message');
        res.body.message.should.have.property('id');
        res.body.message.should.have.property('rating').equal(enumRate.Good);
        res.body.message.should.have.property('articleId').equal(newArticle);
        res.body.message.should.have.property('userId'); //    test exact user from token
        res.body.message.should.have.property('updatedAt');
        res.body.message.should.have.property('createdAt');
        done();
      })
      .catch(err => err);
  });

  it('update a rate of an article', (done) => {
    chai.request(index)
      .post(`/api/articles/${newArticle}/Good`)
      .then((res) => {
        res.body.should.be.a('object');
        res.body.should.have.property('status').equal(403);
        res.body.should.have.property('error').equal('Article is only rated once.');
        done();
      })
      .catch(err => err);
  });
});
