import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function BattlePetsArena() {
    const [player, setPlayer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlayer = async () => {
            const userId = new URLSearchParams(window.location.search).get("id");
            const response = await fetch(`http://localhost:3001/player?id=${userId}`);
            const data = await response.json();
            setPlayer(data);
            setLoading(false);
        };
        fetchPlayer();
    }, []);

    const trainPet = async () => {
        setLoading(true);
        await fetch("http://localhost:3001/train", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: new URLSearchParams(window.location.search).get("id") }),
        });
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4">
            {loading ? (
                <p>Loading...</p>
            ) : (
                <Card className="w-80 text-center">
                    <CardContent>
                        <h2 className="text-xl font-bold">{player?.pet}</h2>
                        <p>المستوى: {player?.level}</p>
                        <p>XP: {player?.exp}/50</p>
                        <Button onClick={trainPet} className="mt-4">تدريب 💪</Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}