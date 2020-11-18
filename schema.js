const { gql } = require('apollo-server');
const db = require('./db.json');

const typeDefs = gql`

 type Beast {
			"ID of beast (taken from binomial initial)"
      id: ID
			"number of legs beast has"
			legs: Int
			"a beasts name in Latin"
	    binomial: String
			"a beasts name to you and I"
	    commonName: String
			"taxonomy grouping"
	    class: String
			"a beasts prey"
	    eats: [ Beast ]
			"a beasts predators"
	    isEatenBy: [ Beast ]

  }

  type Query {
    beasts: [Beast]
		beast(id: ID!): Beast
  }
`

const resolvers = {
	Query: {
		// returns array of all beasts
		beasts: () => db.beasts,
		// returns one beast given ID
		beast: (_, args) => db.beasts.find(element => element.id === args.id)
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
	}
}

exports.typeDefs = typeDefs;
exports.resolvers = resolvers;
