"""Invitation Stage API Views"""
from rest_framework.serializers import ModelSerializer
from rest_framework.viewsets import ModelViewSet

from authentik.flows.api.stages import StageSerializer
from authentik.stages.invitation.models import Invitation, InvitationStage


class InvitationStageSerializer(StageSerializer):
    """InvitationStage Serializer"""

    class Meta:

        model = InvitationStage
        fields = StageSerializer.Meta.fields + [
            "continue_flow_without_invitation",
        ]


class InvitationStageViewSet(ModelViewSet):
    """InvitationStage Viewset"""

    queryset = InvitationStage.objects.all()
    serializer_class = InvitationStageSerializer


class InvitationSerializer(ModelSerializer):
    """Invitation Serializer"""

    class Meta:

        model = Invitation
        fields = [
            "pk",
            "expires",
            "fixed_data",
            "created_by",
        ]
        depth = 2


class InvitationViewSet(ModelViewSet):
    """Invitation Viewset"""

    queryset = Invitation.objects.all()
    serializer_class = InvitationSerializer
    order = ["-expires"]
    search_fields = ["created_by__username", "expires"]
    filterset_fields = ["created_by__username", "expires"]

    def perform_create(self, serializer: InvitationSerializer):
        serializer.save(created_by=self.request.user)
