// import { Request, Response, NextFunction } from 'express';
// import { getRepository } from 'typeorm';
// import jwt from 'jsonwebtoken';
// import { User } from '../entity/user'; // Adjust paths to your entities
// import { UserRoles } from '../entity/userRoles'; // Adjust paths to your entities
// import { Roles } from '../entity/roles';
// import { Permissions } from '../entity/permissions';

// interface JwtPayload {
//     id: number;
// }

// export const checkPermission = (requiredPermission: string) => {
//     return async (req: Request, res: Response, next: NextFunction) => {
//         try {
//             const authHeader = req.headers['authorization'];
//             if (!authHeader) {
//                 return res.status(403).json({ message: 'Forbidden' });
//             }

//             const token = authHeader.split(' ')[1];
//             const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

//             const userRepository = getRepository(User);
//             const userRoleRepository = getRepository(UserRoles);

//             // Fetch user with roles and permissions
//             const user = await userRepository.findOne({ where: { id: decoded.id } });
//             if (!user) {
//                 return res.status(403).json({ message: 'User not found' });
//             }

//             return next()
//             // const userRoles = await userRoleRepository.find({
//             //     where: { user: user },
//             //     relations: ['role', 'role.permissions'],
//             // });

//             // const userPermissions = new Set(
//             //     userRoles.flatMap(userRole =>
//             //         userRole.role.rolePermission.map((permission: Permissions) => permission.name)
//             //     )
//             // );

//             // if (userPermissions.has(requiredPermission)) {
//             //     return next();
//             // } else {
//             //     return res.status(403).json({ message: 'Forbidden' });
//             // }
//         } catch (error) {
//             console.error(error);
//             return res.status(403).json({ message: 'Forbidden' });
//         }
//     };
// };
