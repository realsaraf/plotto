import { SafeAreaView, Text, View } from 'react-native';

export default function Home() {
  return (
    <SafeAreaView className="flex-1 bg-paper-50">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-5xl font-bold text-ink-900">Plotto</Text>
        <Text className="mt-2 text-lg text-ink-500">Your life, plotted out.</Text>
        <View className="mt-8 h-1 w-16 rounded-full bg-coral-500" />
        <Text className="mt-8 text-sm text-ink-400">Phase 0 · Hello.</Text>
      </View>
    </SafeAreaView>
  );
}
