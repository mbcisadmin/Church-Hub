import { describe, it, expect } from 'vitest';
import { ContactSchema } from './contacts';

describe('ContactSchema', () => {
  it('should validate a valid contact', () => {
    const validContact = {
      Contact_ID: 123,
      First_Name: 'John',
      Last_Name: 'Doe',
      Display_Name: 'John Doe',
      Email_Address: 'john@example.com',
      Nickname: null,
      Mobile_Phone: null,
      Company_Phone: null,
      Date_of_Birth: null,
      Gender_ID: null,
      Marital_Status_ID: null,
      Household_ID: null,
      Household_Position_ID: null,
      Participant_Record: null,
      Company: null,
      __Age: null,
    };

    const result = ContactSchema.safeParse(validContact);
    expect(result.success).toBe(true);
  });

  it('should reject contact with invalid email', () => {
    const invalidContact = {
      Contact_ID: 123,
      First_Name: 'John',
      Last_Name: 'Doe',
      Display_Name: 'John Doe',
      Email_Address: 'not-an-email',
      Nickname: null,
      Mobile_Phone: null,
      Company_Phone: null,
      Date_of_Birth: null,
      Gender_ID: null,
      Marital_Status_ID: null,
      Household_ID: null,
      Household_Position_ID: null,
      Participant_Record: null,
      Company: null,
      __Age: null,
    };

    const result = ContactSchema.safeParse(invalidContact);
    expect(result.success).toBe(false);
  });

  it('should allow null email address', () => {
    const contactWithNullEmail = {
      Contact_ID: 123,
      First_Name: 'John',
      Last_Name: 'Doe',
      Display_Name: 'John Doe',
      Email_Address: null,
      Nickname: null,
      Mobile_Phone: null,
      Company_Phone: null,
      Date_of_Birth: null,
      Gender_ID: null,
      Marital_Status_ID: null,
      Household_ID: null,
      Household_Position_ID: null,
      Participant_Record: null,
      Company: null,
      __Age: null,
    };

    const result = ContactSchema.safeParse(contactWithNullEmail);
    expect(result.success).toBe(true);
  });
});
