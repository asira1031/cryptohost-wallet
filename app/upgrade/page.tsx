const isDev = process.env.NODE_ENV === "development";

export default function Home() {
  if (!isDev) {
    return (
      <div>
        Upgrade Page Here
      </div>
    );
  }

  return (
    <div>
      Full App Here
    </div>
  );
}