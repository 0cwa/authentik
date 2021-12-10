"""authentik policy signals"""
from django.core.cache import cache
from django.db.models.signals import post_save
from django.dispatch import receiver
from structlog.stdlib import get_logger

from authentik.core.api.applications import user_app_cache_key

LOGGER = get_logger()


@receiver(post_save)
# pylint: disable=unused-argument
def invalidate_policy_cache(sender, instance, **_):
    """Invalidate Policy cache when policy is updated"""
    from authentik.policies.models import Policy, PolicyBinding

    if isinstance(instance, Policy):
        total = 0
        for binding in PolicyBinding.objects.filter(policy=instance):
            prefix = f"policy_{binding.policy_binding_uuid.hex}_{binding.policy.pk.hex}*"
            total += cache.delete_pattern(prefix)
        LOGGER.debug("Invalidating policy cache", policy=instance, keys=total)
    # Also delete user application cache
    cache.delete_pattern(user_app_cache_key("*"))
