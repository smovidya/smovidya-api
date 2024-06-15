import { Hono } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { env } from "hono/adapter";
interface UserData {
  firstname: string;
  lastname: string;
  ouid: string;
  username: string;
  gecos: string;
  email: string;
  disable: boolean;
  roles: string[];
  firtnameth: string;
  lastnameth: string;
}

const auth = new Hono();

const serviceValidation = async (
  ticket: string,
  DeeAppId: string,
  DeeAppSecret: string
) => {
  try {
    const url = "https://account.it.chula.ac.th/serviceValidation";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        DeeAppId: DeeAppId,
        DeeAppSecret: DeeAppSecret,
        DeeTicket: ticket,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Content-type": "application/json",
      },
    });

    if (response.ok) {
      const jsonResponse = await response.json();
      return {
        status: 200,
        message: jsonResponse,
      };
    } else {
      const jsonResponse = await response.json();
      return {
        status: response.status,
        message: jsonResponse,
      };
    }
  } catch (error) {
    return {
      status: 500,
      message: error,
    };
  }
};

auth.get("/callback", async (c) => {
  const { DeeAppId } = env<{ DeeAppId: string }>(c);
  const { DeeAppSecret } = env<{ DeeAppSecret: string }>(c);
  const ticket = c.req.query("ticket");

  if (!ticket) {
    return c.json({
      message: "Ticket is missing",
      status: 400,
    });
  }

  const { status, message } = await serviceValidation(
    ticket,
    DeeAppId,
    DeeAppSecret
  );
  if (status === 200 && message != null) {
    console.log(message);
    const datas: UserData = message as UserData;
    setCookie(c, "student_id", datas.ouid);
    
    return c.redirect("https://pussadusmocu.vercel.app/users/home", 302);
  }

  return c.json({ message: message });
});

auth.get("/signout", (c) => {
  deleteCookie(c, "first_name");
  deleteCookie(c, "last_name");
  deleteCookie(c, "student_id");
  return c.redirect(
    "https://account.it.chula.ac.th/logout?service=https://pussaduvidyacu.vercel.app/"
  );
});

auth.get("/t", (c) => {
  return c.text("Hello");
});

export default auth;
