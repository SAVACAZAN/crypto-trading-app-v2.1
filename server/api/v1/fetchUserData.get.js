// Importați userSchema din locația potrivită
import { userSchema } from '~/server/models/user.schema';

// Definiți funcția fetchUserData pentru a obține datele utilizatorului
export async function fetchUserData(userID, username, referralCode) {
    try {
        // Căutați utilizatorul în baza de date folosind userSchema
        const userData = await userSchema.findOne({ 
            userID: userID, 
            username: username, 
            referralCode: referralCode 
        });
        
        // Returnați datele utilizatorului găsite
        return {
            status: 200,
            data: userData
        };
    } catch (error) {
        // În caz de eroare, returnați un mesaj de eroare și codul de stare 500
        return {
            status: 500,
            data: { message: error.message }
        };
    }
}
