import React from 'react';


const useSaveImage = () => {
    const [loading, setLoading] = React.useState(false);
    const saveImage = async (imageFormData) => {
        try {
            setLoading(true)
            const token = localStorage.getItem("accessToken");
            const photoSaveResp = await fetch('https://feed-post-app.onrender.com/photo-url', {
                method: "PUT",
                body: imageFormData,
                headers: {
                    "Authorization": "Bearer " + token,
                }
            });
            const response = await photoSaveResp.json()
            setLoading(false);

            return response
        } catch {
            setLoading(false);
            throw new Error(
                "Unknown error occurred"
            );
        }

    }

    return { loading, saveImage };

}

export default useSaveImage