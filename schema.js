const { gql } = require('apollo-server');
const db = require('./db.json');

const typeDefs = gql`
  type Beast {
		"ID of beast (taken from binomial initial)"
		id: ID
		"number of legs beast has"
		legs: Int
		"a beast's name in Latin"
		binomial: String
		"a beast's name to you and I"
		commonName: String
		"taxonomy grouping"
		class: String
		"a beast's prey"
		eats: [ Beast ]
		"a beast's predators"
		isEatenBy: [ Beast ]
	}

  type Query {
		beasts: [Beast]
		beast(id: ID!): Beast
		calledBy(commonName: String!): [Beast]
	}

	type Mutation {
		createBeast(id: ID!, legs: Int!, binomial: String!, 
		  commonName: String!, class: String!, eats: [ ID ]
			): Beast 
	}
`

const resolvers = {
	Query: {
		// Returns array of all beasts.
		beasts: () => db.beasts,
		// Returns one beast given ID.
		// NB: underscore in the arguments refers to 'parent', which is not required, see:
		// https://www.apollographql.com/docs/apollo-server/data/resolvers/#resolver-arguments
		beast: (_, args) => db.beasts.find(element => element.id === args.id),
		// Returns array of beasts where commonName matches partial string
		// NB: The 'args' argument is destructured in this example
		calledBy (_, {commonName}) {
			let namedBeasts = [];
			for (let beast of db.beasts) {
				if (beast.commonName.includes(commonName)) {
					namedBeasts.push(beast);
				}
			}
			return namedBeasts;
		}
	},
	Beast: {
		// Returns an array of beasts that a given beasts eats (e.g. prey).
		// This is a field within db.json, so simply take this field
		// for each beast and see what beasts match this id and then return 
		// as array.
		// Parent argument is beast that API is currently focussed on e.g. housefly.
		eats (parent) {
			let prey = [];
			for (let eaten of parent.eats) {
				prey.push(
					db.beasts.find(
						element => element.id === eaten));
			}
			return prey;
		},
		// Returns an array of beasts that eat a given beast (e.g. predators).
		// This is NOT a field within db.json, so involves more work.
		isEatenBy (parent) {
			let predators = [];
			for (let beast of db.beasts) {
				let predatorId;
				for (let eaten of beast.eats) {
					if (eaten === parent.id) {
						predatorId = beast.id;
					}
				}
				if (predatorId) {
					predators.push(
						db.beasts.find(
							element => element.id === predatorId));
				}
			}
			return predators;
		}
	},
	Mutation: {
		createBeast (_, args) {
			let newBeast = {
				id: args.id, 
				legs: args.legs, 
				binomial: args.binomial, 
				commonName: args.commonName,
				class: args.class,
				eats: args.eats 
			}
			db.beasts.push(newBeast);
		}
	}
}

exports.typeDefs = typeDefs;
exports.resolvers = resolvers;
