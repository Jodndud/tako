import * as React from "react";
import { useMajorCategories } from './useMajorCategories';
import { useMinorCategories } from './useMinorCategories';
import { searchAuctionCardCategory } from "@/lib/card";

export const useAuctionCategory = () => {
    const { setMajorCategoryId, majorCategories, majorLoading } = useMajorCategories();
    const { handleGetMinorCategories, setMinorCategoryId, minorCategories, minorLoading } = useMinorCategories();

    const [selectedMajor, setSelectedMajor] = React.useState<number | null>(null);
    const [selectedMinor, setSelectedMinor] = React.useState<number | null>(null);
    const [selectedCard, setSelectedCard] = React.useState<number | null>(null);

    const [selectedMajorName, setSelectedMajorName] = React.useState<string | null>(null);
    const [selectedMinorName, setSelectedMinorName] = React.useState<string | null>(null);
    const [selectedCardName, setSelectedCardName] = React.useState<string | null>(null);
    const [selectedCardImageUrl, setSelectedCardImageUrl] = React.useState<string | null>(null);

    const [cards, setCards] = React.useState<any[]>([]);
    const [loadingCards, setLoadingCards] = React.useState(false);

    const handleMajorClick = (cat: { id: number; name: string }, onChange?: (majorId: number|null, majorName: string|null, minorId: number|null, minorName: string|null, cardId:number|null, cardName:string|null, cardImageUrls:string|null) => void) => {
        setSelectedMajor(cat.id);
        setSelectedMajorName(cat.name);
        setMajorCategoryId(cat.id);

        handleGetMinorCategories(cat.id);
        setSelectedMinor(null);
        setSelectedMinorName(null);
        setSelectedCard(null);
        setSelectedCardName(null);

        if (onChange) onChange(cat.id, cat.name, null, null, null, null, null);
    };

    const handleMinorClick = async (minor: { id: number; name: string }, onChange?: (majorId: number|null, majorName: string|null, minorId: number|null, minorName: string|null, cardId:number|null, cardName:string|null, cardImageUrls:string|null) => void) => {
        setSelectedMinor(minor.id);
        setSelectedMinorName(minor.name);
        setMinorCategoryId(minor.id);
        setSelectedCard(null);
        setSelectedCardName(null);

        if (onChange) onChange(selectedMajor, selectedMajorName, minor.id, minor.name, null, null, null);

        if (selectedMajor !== null) {
            setLoadingCards(true);
            try {
            const res = await searchAuctionCardCategory(selectedMajor, minor.id);
            setCards(res.result.content);
            } catch (err) {
            console.error(err);
            setCards([]);
            } finally {
            setLoadingCards(false);
            }
        }
    };

    const handleCardClick = (card: { id: number; name: string, imageUrls: string }, onChange?: (majorId: number|null, majorName: string|null, minorId: number|null, minorName: string|null, cardId:number|null, cardName:string|null, cardImageUrls:string|null) => void) => {
        setSelectedCard(card.id);
        setSelectedCardName(card.name);
        setSelectedCardImageUrl(card.imageUrls);
        if (onChange)
        onChange(selectedMajor, selectedMajorName, selectedMinor, selectedMinorName, card.id, card.name, card.imageUrls);
    };

    // 카테고리 재선택
    const resetSelection = () => {
        setSelectedMajor(null);
        setSelectedMinor(null);
        setSelectedCard(null);
        setSelectedCardName("");
        setSelectedCardImageUrl("");
    };

    return {
        majorCategories, majorLoading, minorCategories, minorLoading,
        selectedMajor, selectedMinor, selectedCard, selectedMajorName, selectedMinorName, selectedCardName, selectedCardImageUrl,
        cards,loadingCards,
        handleMajorClick, handleMinorClick, handleCardClick, resetSelection,
    };
};
