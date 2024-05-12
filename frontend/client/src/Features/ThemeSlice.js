import { createSlice } from "@reduxjs/toolkit";

export const themeSlice = createSlice({

    name: 'themeSlice',
    initialState: true,
  
    reducers: {
        toggleTheme: (state) => {
            // Correct way to toggle a boolean value
            return !state;
        },
    },

});

export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
