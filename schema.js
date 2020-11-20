const { gql } = require('apollo-server');
const db = require('./db.json');

// The statements within quotes are used by GraphQL to provide
// human readable descriptions to developers using the API
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
		taxClass: String
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
			commonName: String!, taxClass: String!, eats: [ ID ]
			): Beast 
	}
`

const resolvers = {

	Query: {

		// Returns array of all beasts.
		beasts: () => db.beasts,

		// Returns one beast given ID.
		// Underscore in the arguments is required and 
		// refers to 'parent', see:
		// https://www.apollographql.com/docs/apollo-server/data/resolvers/#resolver-arguments
		beast: (_, args) => db.beasts.find(element => element.id === args.id),

		// Returns array of beasts where commonName matches 
		// partial string.
		// 'Args' argument is destructured here, 
		// e.g. curly brackets means we don't have to write
		// 'args.commonName'
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

		// Returns an array of beasts eaten (e.g. prey).
		// This is a field corresponding to an array of IDs
		// within db.json; so this matches those IDs to Beast
		// objects and then returns those objects as an array.
		// Parent argument is beast that API is currently 
		// focussed on e.g. housefly.
		eats (parent) {
			let prey = [];
			for (let eaten of parent.eats) {
				prey.push(
					db.beasts.find(
						element => element.id === eaten));
			}
			return prey;
		},

		// Returns an array of beasts that eat a given beast 
		// (e.g. predators).
		// This is NOT a field within db.json, so 
		// involves calculating from list of prey within db.json.
		// i.e. if x eats y, then y isEatenBy x.
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

	// Adds (and returns) new beast created by user.
	// As this is a minimal example it does not save to 
	// db.json.  As it is in memory only will delete 
	// on node restart.
	Mutation: {
		createBeast (_, args) {
			let newBeast = {
				id: args.id, 
				legs: args.legs, 
				binomial: args.binomial, 
				commonName: args.commonName,
				taxClass: args.taxClass,
				eats: args.eats 
			}
			db.beasts.push(newBeast);
			return newBeast;
		}
	}
}

exports.typeDefs = typeDefs;
exports.resolvers = resolvers;
