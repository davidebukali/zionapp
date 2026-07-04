import { ScrollView, View } from "react-native";
import { useTheme } from "react-native-paper";

import { globalStyles } from "../../assets/styles/theme";
import PostCard from "../../components/Posts/PostCard";

export default function Index() {
  const theme = useTheme();

  return (
    <View style={[globalStyles.screen, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={globalStyles.feedContainer}
        showsVerticalScrollIndicator={false}
      >
        <PostCard
          title="Alex Rivera"
          subtitle="2h ago"
          likes="1.2k"
          comments="48"
        />
        <PostCard
          title="Elena Vance"
          subtitle="5h ago"
          avatarUrl="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80"
          imageUrl="https://images.unsplash.com/photo-1472148439583-1f4cf81b80e0?auto=format&fit=crop&w=1400&q=80"
          body="Finding inspiration in the raw energy of nature. The color palette of this volcanic field is exactly what we need for the next collection."
          likes="3.5k"
          comments="124"
          liked
        />
      </ScrollView>
    </View>
  );
}
