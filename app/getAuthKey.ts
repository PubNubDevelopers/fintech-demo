  //  This sample uses Access Manager to protect the Pub/Sub keys
  //  IN PRODUCTION: Replace with your own logic to request an Access Manager token

  export async function getAuthKey(
    userId: string
  ): Promise<{ accessManagerToken: string | undefined }> {
    try {
      console.log("Getting Auth Key")
      const TOKEN_SERVER =
        "https://devrel-demos-access-manager.netlify.app/.netlify/functions/api/fintech-apac1";
      const response = await fetch(`${TOKEN_SERVER}/grant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ UUID: userId }),
      });
  
      const data = await response.json();
      if (data.statusCode !== 200) {
        console.log(data.message);
      } else {
        const token = data.body.token;
        return {
          accessManagerToken: token,
        };
      }
    } catch (error: any) {
      console.log(
        "Failed to obtain the Access Manager token for demo:" + error.message
      );
    }
  
    return {
      accessManagerToken: undefined,
    };
  }
  