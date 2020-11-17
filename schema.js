const { gql } = require('apollo-server');
const db = require('./db.json');

const typeDefs = gql`

 type Beast {
      id: ID
			legs: Int
	    binomial: String
	    commonName: String
	    class: String
	    eats: [ Beast ]
			"beast eaten by"
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
		eats (parent) {
			let eatenBeasts = [];
			for (eaten of parent.eats) {
				eatenBeasts.push(
					db.beasts.find(
						element => element.id === eaten));
			}
			return eatenBeasts;
		}
		
		// eats: (parent) => db.beasts.find(element => element.id === parent.eats.id)
		// eats (parent, args) {  
		// 	console.log(args.id) 
		// 	console.log(parent.eats) 
		// }
	}
}

exports.typeDefs = typeDefs;
exports.resolvers = resolvers;


/*
import db from './db.json';
import itemModel from './models'
import { gql } from 'apollo-server-express'

console.log(db.items);

export const typeDefs = gql`

 type Item {
      niin: String
      nsc: String
      smbi: String
      basic_price: Int 
      long_item_name: String
      short_item_name: String
      uoi: String
  }

  type Query {
    allitems: [Item]
		details: String
		anitem: Item
		searchitem(searchterm: String!): Item
		searchItemMore(searchTerm: String!): String
  }
`
	var testniin = "999998953";

export const resolvers = {
	Query: {
		allitems: () => db.items,
		anitem: () => db.items.find(element => element.niin === '009998911'),
		searchitem: (_, {searchterm}) => db.items.find(element => element.niin === searchterm),
		searchItemMore: function(_, args) {
			return args.searchTerm;
		}
}
}

*/

// export const resolvers = {
// 	Query: {
// 		items() {
// 			return itemModel.list()
// 		},
// 		details: () =>  { return "hello" }
// 		// finditem: (_, { niin }, __) => { return Item }
// 	},
// 	Item: {
// 		niin: (parent) => parent.long_item_name
// 	}
// }


