import { sessionManager } from '../services/sessions/sessions';
import { User } from './user_entity';

// export async function GetUser(context) {
//   var user: User | null;

//   //Grab session data from server global memory and return it using the context req cookie value
//   user = await sessionManager.GetSessionUser(context);

//   //Node we don't want to return the userId for security reasons
//   return user;
// }

export function serializeUser(user: any): any {
  // Check if the input is an array
  if (Array.isArray(user)) {
    return user.map((item) => serializeUser(item));
  }
  // Check if the input is an object
  else if (user !== null && typeof user === 'object') {
    return Object.keys(user).reduce((acc, key) => {
      const value = user[key];
      if (value instanceof Date) {
        acc[key] = value.toISOString(); // Convert Date to ISO string
      } else if (
        value &&
        typeof value === 'object' &&
        value._bsontype === 'ObjectID'
      ) {
        acc[key] = value.toString(); // Convert ObjectId to string
      } else {
        acc[key] = serializeUser(value); // Recurse for nested objects/arrays
      }
      return acc;
    }, {} as any);
  }
  // Base case: return the item if it's neither an object nor an array
  else {
    return user;
  }
}
