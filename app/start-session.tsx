import { DancingScript_400Regular, DancingScript_700Bold, useFonts } from '@expo-google-fonts/dancing-script';
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from '../contexts/session-context';

interface WardrobeCategory {
    id: string;
    name: string;
    subtitle: string;
    items: WardrobeItem[];
}

interface WardrobeItem {
    id: string;
    image: string;
}

const wardrobeCategories: WardrobeCategory[] = [
    {
        id: "1",
        name: "Striped Crop Shirt",
        subtitle: "AI Powered",
        items: [
            {
                id: "1",
                image: "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=150&h=200&fit=crop",
            },
            {
                id: "2",
                image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=150&h=200&fit=crop",
            },
            {
                id: "3",
                image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=150&h=200&fit=crop",
            },
            {
                id: "4",
                image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=150&h=200&fit=crop",
            },
            {
                id: "5",
                image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=150&h=200&fit=crop",
            },
        ],
    },
    {
        id: "2",
        name: "Modern Kurtis",
        subtitle: "AI Powered",
        items: [
            {
                id: "6",
                image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=150&h=200&fit=crop",
            },
            {
                id: "7",
                image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=150&h=200&fit=crop",
            },
            {
                id: "8",
                image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=150&h=200&fit=crop",
            },
        ],
    },
    {
        id: "3",
        name: "Daytime Looks",
        subtitle: "AI Powered",
        items: [
            {
                id: "9",
                image: "https://images.unsplash.com/photo-1516726817505-f5ed825624d8?w=300&h=200&fit=crop",
            },
            {
                id: "10",
                image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=150&h=200&fit=crop",
            },
        ],
    },
];

type SessionStep = "wardrobe" | "notify" | "start";

const mockSessionParticipants = [
  {
    id: '1',
    name: 'You',
    avatar: '👤',
    isMuted: false,
    currentProduct: null
  },
  {
    id: '2',
    name: 'Chinku',
    avatar: '👩',
    isMuted: true,
    currentProduct: {
      id: '1',
      name: 'Red Silk Saree',
      image: '👗'
    }
  },
  {
    id: '3',
    name: 'Minku',
    avatar: '👩‍🦱',
    isMuted: false,
    currentProduct: {
      id: '2',
      name: 'Blue Kurta',
      image: '👔'
    }
  },
  {
    id: '4',
    name: 'Tinku',
    avatar: '👩‍🦰',
    isMuted: false,
    currentProduct: null
  },
  {
    id: '5',
    name: 'Poha',
    avatar: '👩‍💼',
    isMuted: true,
    currentProduct: null
  },
  {
    id: '6',
    name: 'Juhi',
    avatar: '👩‍🎨',
    isMuted: true,
    currentProduct: null
  },
];

export default function StartSessionScreen() {
    const { startSession } = useSession();
    const [currentStep, setCurrentStep] = useState<SessionStep>("wardrobe");
    const [selectedWardrobe, setSelectedWardrobe] = useState<string | null>(null);
    const [notifyMembers, setNotifyMembers] = useState(true);
    const [isNotifying, setIsNotifying] = useState(false);

    let [fontsLoaded] = useFonts({
        DancingScript_400Regular,
        DancingScript_700Bold,
    });

    if (!fontsLoaded) {
        return null;
    }

    const handleWardrobeSelect = (wardrobeId: string) => {
        setSelectedWardrobe(wardrobeId);
        setCurrentStep("notify");
    };

    const handleNotifyMembers = () => {
        if (notifyMembers) {
            setIsNotifying(true);
            // Simulate notification process
            setTimeout(() => {
                setIsNotifying(false);
                setCurrentStep("start");
            }, 2000);
        } else {
            setCurrentStep("start");
        }
    };

    const handleStartSession = () => {
        // Start session as host and navigate to catalog
        startSession('1', mockSessionParticipants, true);
        router.push("/catalog");
    };

    const handlePrevious = () => {
        if (currentStep === "notify") {
            setCurrentStep("wardrobe");
        } else if (currentStep === "start") {
            setCurrentStep("notify");
        }
    };

    const renderProgressIndicator = () => {
        const steps = [
            { key: "wardrobe", label: "Link a wardrobe", completed: currentStep !== "wardrobe" },
            { key: "notify", label: "Notify members", completed: currentStep === "start" },
            { key: "start", label: "Start a Session", completed: false },
        ];

        return (
            <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                    {/* Connecting line */}
                    <View style={styles.progressLine} />
                    
                    {steps.map((step, index) => (
                        <View key={step.key} style={styles.stepContainer}>
                            <View
                                style={[
                                    styles.stepCircle,
                                    step.completed && styles.stepCircleCompleted,
                                    step.key === currentStep && !step.completed && styles.stepCircleActive,
                                ]}
                            >
                                {step.completed && (
                                    <Text style={styles.checkmark}>✓</Text>
                                )}
                            </View>
                            <Text
                                style={[
                                    styles.stepLabel,
                                    step.completed && styles.stepLabelCompleted,
                                    step.key === currentStep && !step.completed && styles.stepLabelActive,
                                ]}
                            >
                                {step.label}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    const renderWardrobeItem = ({ item }: { item: WardrobeItem }) => (
        <Image source={{ uri: item.image }} style={styles.wardrobeItemImage} />
    );

    const renderWardrobeCategory = ({ item, index }: { item: WardrobeCategory; index: number }) => {
        const isEven = index % 2 === 0;
        const gradientColors = isEven 
            ? ['#F3F1FE', '#FFFFFF'] as const // Purple to white
            : ['#FFEEEC', '#FFFFFF'] as const; // Pink to white
        
        return (
            <LinearGradient
                colors={gradientColors}
                style={styles.categoryContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            >
                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>Editor</Text>
                </View>
                
                <View style={styles.categoryHeader}>
                    <View style={styles.categoryInfo}>
                        <Text style={styles.categoryName}>{item.name}</Text>
                        <View style={styles.subtitleContainer}>
                            <View style={styles.aiIcon} />
                            <Text style={styles.categorySubtitle}>{item.subtitle}</Text>
                        </View>
                    </View>
                </View>

                <FlatList
                    data={item.items}
                    renderItem={renderWardrobeItem}
                    keyExtractor={(wardrobeItem) => wardrobeItem.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.itemsList}
                    style={styles.horizontalList}
                />

                <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={() => handleWardrobeSelect(item.id)}
                >
                    <Text style={styles.viewAllText}>Select</Text>
                    <Text style={styles.viewAllArrow}>›</Text>
                </TouchableOpacity>
            </LinearGradient>
        );
    };

    const renderWardrobeStep = () => (
        <View style={styles.stepContent}>
            <FlatList
                data={wardrobeCategories}
                renderItem={({ item, index }) => renderWardrobeCategory({ item, index })}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.categoriesList}
            />
        </View>
    );

    const renderNotifyStep = () => (
        <View style={styles.stepContent}>
            <View style={styles.notifyGifContainer}>
                <Image 
                    source={require('@/assets/GIF/notify_members.gif')} 
                    style={styles.notifyGif}
                    resizeMode="contain"
                />
            </View>
            
            <View style={styles.notifyBottomSection}>
                {isNotifying ? (
                    <View style={styles.notifyingContainer}>
                        <Text style={styles.notifyingText}>Notifying members....</Text>
                    </View>
                ) : (
                    <View style={styles.checkboxSection}>
                        <TouchableOpacity
                            style={styles.checkboxContainer}
                            onPress={() => setNotifyMembers(!notifyMembers)}
                        >
                            <View style={[styles.checkbox, notifyMembers && styles.checkboxChecked]}>
                                {notifyMembers && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <Text style={styles.checkboxLabel}>Notify members</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
            
            {!isNotifying && (
                <View style={styles.navigationButtons}>
                    <TouchableOpacity
                        style={styles.previousButton}
                        onPress={handlePrevious}
                    >
                        <Text style={styles.previousButtonText}>Previous</Text>
                    </TouchableOpacity>
                      <TouchableOpacity
                          style={styles.nextButton}
                          onPress={handleNotifyMembers}
                      >
                          <Text style={styles.nextButtonText}>Next</Text>
                      </TouchableOpacity>
                </View>
            )}
        </View>
    );

    const renderStartStep = () => (
        <View style={styles.stepContent}>
            <View style={styles.startContainer}>
                <TouchableOpacity
                    style={styles.startButton}
                    onPress={handleStartSession}
                >
                    <Text style={styles.startButtonText}>START</Text>
                </TouchableOpacity>
            </View>
            
            <View style={styles.navigationButtons}>
                <TouchableOpacity
                    style={styles.previousButton}
                    onPress={handlePrevious}
                >
                    <Text style={styles.previousButtonText}>Previous</Text>
                </TouchableOpacity>
                <View style={styles.spacer} />
            </View>
        </View>
    );

    const renderCurrentStep = () => {
        switch (currentStep) {
            case "wardrobe":
                return renderWardrobeStep();
            case "notify":
                return renderNotifyStep();
            case "start":
                return renderStartStep();
            default:
                return renderWardrobeStep();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Start Sessions</Text>
                <View style={styles.headerSpacer} />
            </View>

            {renderProgressIndicator()}
            {renderCurrentStep()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backButton: {
        width: 40,
        alignItems: "flex-start",
    },
    backButtonText: {
        fontSize: 24,
        color: "#666",
        fontWeight: "300",
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000",
        textAlign: "center",
    },
    headerSpacer: {
        width: 40,
    },
    progressContainer: {
        paddingHorizontal: 25,
        paddingVertical: 16,
    },
    progressTrack: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative",
    },
    progressLine: {
        position: "absolute",
        top: 8,
        left: 60,
        right: 60,
        height: 1,
        backgroundColor: "#E0E0E0",
        zIndex: 1,
    },
    stepContainer: {
        alignItems: "center",
        flex: 1,
        zIndex: 2,
    },
    stepCircle: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: "#808080",
        marginBottom: 6,
    },
    stepCircleCompleted: {
        backgroundColor: "white",
        borderWidth: 2,
        borderColor: "#E91E63",
        width: 16,
        height: 16,
        borderRadius: 8,
    },
    stepCircleActive: {
        backgroundColor: "white",
        borderWidth: 2,
        borderColor: "#E91E63",
        width: 16,
        height: 16,
        borderRadius: 8,
    },
    checkmark: {
        color: "#E91E63",
        fontSize: 8,
        fontWeight: "bold",
    },
    stepLabel: {
        fontSize: 9,
        color: "#808080",
        textAlign: "center",
    },
    stepLabelCompleted: {
        color: "#E91E63",
    },
    stepLabelActive: {
        color: "#E91E63",
        fontWeight: "600",
    },
    stepContent: {
        flex: 1,
    },
    categoriesList: {
        paddingVertical: 12,
        paddingBottom: 100,
    },
    categoryContainer: {
        marginBottom: 24,
        paddingTop: 16,
        paddingHorizontal: 16,
        paddingBottom: 0,
        minHeight: 220,
    },
    categoryHeader: {
        marginBottom: 8,
    },
    horizontalList: {
        marginHorizontal: -16,
        marginBottom: 0,
    },
    itemsList: {
        paddingHorizontal: 16,
        gap: 8,
    },
    wardrobeItemImage: {
        width: 140,
        height: 150,
        borderRadius: 8,
        marginRight: 8,
        backgroundColor: "#f0f0f0",
    },
    categoryFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    categoryInfo: {
        flex: 1,
    },
    categoryName: {
        fontSize: 12,
        fontWeight: "600",
        color: "#000",
    },
    subtitleContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    aiIcon: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#FF69B4",
        marginRight: 4,
    },
    categorySubtitle: {
        fontSize: 10,
        color: "#666",
    },
    roleBadge: {
        position: "absolute",
        top: 8,
        right: 16,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 8,
        zIndex: 10,
    },
    roleText: {
        fontSize: 8,
        color: "#CCCCCC",
        fontWeight: "500",
    },
    viewAllButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 6,
        marginTop: 12,
        marginHorizontal: 16,
        marginBottom: 12,
        backgroundColor: "#F5F5F5",
        borderRadius: 8,
        alignSelf: "center",
        minWidth: 370,
    },
    viewAllText: {
        fontSize: 12,
        color: "#333",
        fontWeight: "500",
        marginRight: 4,
    },
    viewAllArrow: {
        fontSize: 12,
        color: "#333",
        fontWeight: "500",
    },
    notifyGifContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 180,
    },
    notifyGif: {
        width: 500,
        height: 500,
    },
    notifyBottomSection: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 20,
    },
    notifyingContainer: {
        alignItems: "center",
        paddingBottom: 70,
    },
    notifyingText: {
        fontSize: 12,
        color: "#666",
        textAlign: "center",
    },
    checkboxSection: {
        alignItems: "center",
    },
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: "#E91E63",
        marginRight: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    checkboxChecked: {
    },
    checkboxLabel: {
        fontSize: 12,
        color: "#333",
        fontWeight: "300",
    },
    navigationButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 12,
    },
    previousButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    previousButtonText: {
        fontSize: 10,
        fontWeight: "400",
        color: "#666",
    },
    nextButton: {
        flex: 1,
        backgroundColor: "#E91E63",
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    nextButtonText: {
        color: "white",
        fontSize: 10,
        fontWeight: "600",
    },
    spacer: {
        flex: 1,
    },
    startContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    startButton: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#E91E63",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#E91E63",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    startButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
});
